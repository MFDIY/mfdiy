import type { Area, Cell, Layout, Page, ResizeHandle, TokenValues, WidgetInstance } from '@mfdiy/schema';

import { applyTokens, mfdRoot } from '@mfdiy/instruments';
import { areasEqual, areasOverlap, bringToFront, findOverlaps, moveArea, resizeArea, withArea } from '@mfdiy/schema';
import { Box, Text } from '@mfdiy/ui/components';
import { useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';

import * as styles from './Canvas.css.js';
import { CanvasWidget } from './CanvasWidget.js';
import { widgetMinSize } from './widgetInfo.js';

/** How far a pointer travels, in pixels, before a press becomes a drag. Fingers are less steady. */
const DRAG_THRESHOLD = { mouse: 4, touch: 8 };

/**
 * A press on a widget or handle, from `pointerdown` until release. Everything measured is captured
 * at the start, so the result depends only on the start and the pointer's current position.
 */
type Gesture = {
  pointerId: number;
  widgetId: string;
  /** Undefined when moving the widget. */
  handle: ResizeHandle | undefined;
  startArea: Area;
  startX: number;
  startY: number;
  /** One cell including the gap, in pixels. */
  cellWidth: number;
  cellHeight: number;
  threshold: number;
  /** Distance travelled so far, in pixels. */
  x: number;
  y: number;
  /** Whether the press has become a drag. */
  dragging: boolean;
};

export type CanvasProps = {
  page: Page;
  /** The layout being edited: one of the page's own. */
  layout: Layout;
  /** Document-wide theme overrides; the page's own are applied on top. */
  documentTokens?: TokenValues | undefined;
  /** Width divided by height of the preview shape. Fills the available space if not set. */
  aspectRatio?: number | undefined;
  selectedId: string | null;
  onSelect: (widgetId: string | null) => void;
  onChange: (page: Page) => void;
  /** Cells to highlight, e.g. where a widget is about to be added. */
  ghost?: Area | null | undefined;
  /**
   * Fires when an empty cell is tapped while nothing is selected: with a selection, the first tap
   * only lets go of it. Comes with where the grid is on the screen.
   */
  onEmptyTap?: ((cell: Cell, gridOnScreen: DOMRect) => void) | undefined;
  /** Renders a widget's contents. Presses never reach it. */
  renderWidget: (widget: WidgetInstance) => ReactNode;
};

/**
 * The page being edited: select, move and resize widgets on the grid. Fits any box it's given and
 * knows nothing about the page around it, so it can be reused on the display (0008, 0009).
 */
export function Canvas({
  page,
  layout,
  documentTokens,
  aspectRatio,
  selectedId,
  onSelect,
  onChange,
  ghost,
  onEmptyTap,
  renderWidget
}: CanvasProps) {
  const dotsRef = useRef<HTMLDivElement>(null);
  /** Where a press on the empty grid started, if it could become a tap. */
  const emptyPressRef = useRef<{ x: number; y: number; threshold: number } | null>(null);
  const [gesture, setGesture] = useState<Gesture | null>(null);

  const minSizes = new Map(page.widgets.map(widget => [widget.id, widgetMinSize(widget, layout.grid)]));

  /** Where the gesture would put the widget. */
  function targetArea({ widgetId, handle, startArea, cellWidth, cellHeight, x, y }: Gesture): Area {
    const offset = { columns: Math.round(x / cellWidth), rows: Math.round(y / cellHeight) };

    return handle
      ? resizeArea(startArea, handle, offset, layout.grid, minSizes.get(widgetId))
      : moveArea(startArea, offset, layout.grid);
  }

  function update(current: Gesture, event: PointerEvent): Gesture {
    const x = event.clientX - current.startX;
    const y = event.clientY - current.startY;

    return { ...current, x, y, dragging: current.dragging || Math.hypot(x, y) >= current.threshold };
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>, widgetId: string, handle?: ResizeHandle) {
    const startArea = layout.areas[widgetId];
    const dots = dotsRef.current?.getBoundingClientRect();

    // One gesture at a time: a second finger never interferes with a drag.
    if (gesture || event.button !== 0 || !startArea || !dots) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    setGesture({
      pointerId: event.pointerId,
      widgetId,
      handle,
      startArea,
      startX: event.clientX,
      startY: event.clientY,
      cellWidth: dots.width / layout.grid.columns,
      cellHeight: dots.height / layout.grid.rows,
      threshold: event.pointerType === 'mouse' ? DRAG_THRESHOLD.mouse : DRAG_THRESHOLD.touch,
      x: 0,
      y: 0,
      dragging: false
    });
  }

  function handlePointerMove(event: PointerEvent) {
    if (gesture?.pointerId !== event.pointerId) {
      return;
    }

    const next = update(gesture, event);

    if (next.dragging && !gesture.dragging) {
      onSelect(next.widgetId);
    }

    setGesture(next);
  }

  function cellAt(event: MouseEvent, dots: DOMRect): Cell {
    const column = Math.floor(((event.clientX - dots.left) / dots.width) * layout.grid.columns) + 1;
    const row = Math.floor(((event.clientY - dots.top) / dots.height) * layout.grid.rows) + 1;

    // The outer edges of the dots are just beyond the grid.
    return {
      column: Math.min(Math.max(column, 1), layout.grid.columns),
      row: Math.min(Math.max(row, 1), layout.grid.rows)
    };
  }

  function handleEmptyPointerDown(event: PointerEvent) {
    emptyPressRef.current = null;

    if (event.target !== event.currentTarget || gesture) {
      return;
    }

    if (selectedId !== null) {
      onSelect(null);
    } else if (event.isPrimary && event.button === 0) {
      emptyPressRef.current = {
        x: event.clientX,
        y: event.clientY,
        threshold: event.pointerType === 'mouse' ? DRAG_THRESHOLD.mouse : DRAG_THRESHOLD.touch
      };
    }
  }

  /**
   * On click rather than when the pointer is released: touch screens click after that, on whatever
   * has appeared under the finger by then.
   */
  function handleEmptyClick(event: MouseEvent) {
    const press = emptyPressRef.current;
    const dots = dotsRef.current?.getBoundingClientRect();

    emptyPressRef.current = null;

    if (!press || !dots || event.target !== event.currentTarget) {
      return;
    }

    const cell = cellAt(event, dots);
    const occupied = Object.values(layout.areas).some(area =>
      // The gaps between widgets aren't empty cells.
      areasOverlap(area, { ...cell, columnSpan: 1, rowSpan: 1 })
    );

    if (!occupied && Math.hypot(event.clientX - press.x, event.clientY - press.y) < press.threshold) {
      onEmptyTap?.(cell, dots);
    }
  }

  /**
   * Selects the pressed widget. Pressing the selected widget again selects the next one underneath,
   * so widgets hidden behind others can be reached.
   */
  function handleTap(widgetId: string, event: PointerEvent) {
    const dots = dotsRef.current?.getBoundingClientRect();

    if (widgetId !== selectedId || !dots) {
      onSelect(widgetId);
      return;
    }

    const cell = cellAt(event, dots);

    const stack = page.widgets
      .map(widget => widget.id)
      .filter(id => {
        const area = layout.areas[id];

        return area && areasOverlap(area, { ...cell, columnSpan: 1, rowSpan: 1 });
      })
      // Later widgets are on top.
      .reverse();

    onSelect(stack[(stack.indexOf(widgetId) + 1) % stack.length] ?? widgetId);
  }

  function handlePointerUp(event: PointerEvent) {
    if (gesture?.pointerId !== event.pointerId) {
      return;
    }

    const final = update(gesture, event);
    const area = targetArea(final);

    setGesture(null);

    if (!final.dragging) {
      if (!final.handle) {
        handleTap(final.widgetId, event);
      }
    } else if (layout.areas[final.widgetId] && !areasEqual(area, final.startArea)) {
      const placed = withArea(layout, final.widgetId, area);
      const next = { ...page, layouts: page.layouts.map(other => (other === layout ? placed : other)) };

      // A moved widget stays on top, or it could vanish behind another once deselected.
      onChange(final.handle ? next : bringToFront(next, final.widgetId));
    }
  }

  /** The browser took the pointer away (or the gesture has already ended): never commit. */
  function handlePointerLost(event: PointerEvent) {
    setGesture(current => (current?.pointerId === event.pointerId ? null : current));
  }

  const drag = gesture?.dragging ? { ...gesture, area: targetArea(gesture) } : null;
  const overlaps = findOverlaps(drag ? withArea(layout, drag.widgetId, drag.area) : layout);

  return (
    <Box
      alignItems='center'
      containerType='size'
      display='flex'
      height='full'
      justifyContent='center'
      minHeight='none'
      minWidth='none'
      width='full'
    >
      <Box
        className={mfdRoot}
        containerType='size'
        data-canvas='frame'
        flexShrink='0'
        style={{
          ...applyTokens(documentTokens),
          height: aspectRatio ? `min(100cqh, ${100 / aspectRatio}cqw)` : '100%',
          width: aspectRatio ? `min(100cqw, ${100 * aspectRatio}cqh)` : '100%'
        }}
      >
        <Box
          aria-label={`Canvas, page ${page.name}`}
          className={styles.page}
          height='full'
          onContextMenu={event => {
            // A long press must not open a menu halfway through a drag.
            if (gesture) {
              event.preventDefault();
            }
          }}
          onLostPointerCapture={handlePointerLost}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          overscrollBehavior='none'
          position='relative'
          role='group'
          style={applyTokens(page.tokens)}
          touchAction='none'
          userSelect='none'
        >
          <Box
            className={styles.grid}
            display='grid'
            height='full'
            onClick={handleEmptyClick}
            onPointerDown={handleEmptyPointerDown}
            position='relative'
            style={{
              gridTemplateColumns: `repeat(${layout.grid.columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${layout.grid.rows}, minmax(0, 1fr))`
            }}
          >
            <Box
              backgroundImage='canvas.dots'
              className={styles.dots}
              data-canvas='dots'
              pointerEvents='none'
              position='absolute'
              ref={dotsRef}
              style={{ backgroundSize: `${100 / layout.grid.columns}% ${100 / layout.grid.rows}%` }}
            />
            {page.widgets.map(widget => {
              const area = layout.areas[widget.id];

              if (!area) {
                return null;
              }

              const dragged = drag?.widgetId === widget.id ? drag : null;

              return (
                <CanvasWidget
                  // A resize happens in place; a moved widget follows the pointer above its ghost.
                  area={dragged?.handle ? dragged.area : area}
                  key={widget.id}
                  lifted={dragged && !dragged.handle ? { x: dragged.x, y: dragged.y } : null}
                  onPointerDown={handlePointerDown}
                  onSelect={onSelect}
                  selected={widget.id === selectedId}
                  widget={widget}
                >
                  {renderWidget(widget)}
                </CanvasWidget>
              );
            })}
            {drag || ghost ? <Ghost area={drag?.area ?? (ghost as Area)} /> : null}
            {overlaps.map(({ widgetIds, area }) => (
              // Striped and dashed as well as red, so it doesn't rely on colour alone.
              <Box
                backgroundImage='canvas.overlap'
                borderColor='canvas.overlap'
                borderRadius='1x'
                borderStyle='dashed'
                borderWidth='canvas'
                boxShadow='canvas.halo'
                data-canvas='overlap'
                key={widgetIds.join(' ')}
                pointerEvents='none'
                position='relative'
                style={{
                  gridColumn: `${area.column} / span ${area.columnSpan}`,
                  gridRow: `${area.row} / span ${area.rowSpan}`
                }}
                zIndex='3'
              />
            ))}
          </Box>
          {onEmptyTap && page.widgets.length === 0 && !ghost ? (
            <Box
              alignItems='center'
              display='flex'
              inset='none'
              justifyContent='center'
              pointerEvents='none'
              position='absolute'
            >
              <Box backgroundColor='elevation.floating' borderRadius='2x' color='body' padding='4x'>
                <Text variant='body'>Tap anywhere to add a widget</Text>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

function Ghost({ area }: { area: Area }) {
  return (
    <Box
      backgroundColor='canvas.ghost'
      borderColor='canvas.ghost'
      borderRadius='1x'
      borderStyle='solid'
      borderWidth='canvas'
      boxShadow='canvas.halo'
      data-canvas='ghost'
      pointerEvents='none'
      position='relative'
      style={{
        gridColumn: `${area.column} / span ${area.columnSpan}`,
        gridRow: `${area.row} / span ${area.rowSpan}`
      }}
      // Above a lifted widget, which would otherwise hide it.
      zIndex='3'
    />
  );
}
