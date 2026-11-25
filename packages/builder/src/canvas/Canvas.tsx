import type { Area, CellSize, Layout, Page, ResizeHandle, TokenValues, WidgetInstance } from '@mfdiy/schema';

import { applyTokens, mfdRoot } from '@mfdiy/instruments';
import { areasEqual, canPlace, findFreeStep, moveArea, resizeArea, withArea } from '@mfdiy/schema';
import { clsx } from 'clsx';
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

import * as styles from './Canvas.css.js';
import { CanvasWidget } from './CanvasWidget.js';
import { widgetMinSize, widgetName } from './widgetInfo.js';

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
  /** The page's layout being edited. */
  layout: Layout;
  /** Document-wide theme overrides; the page's own are applied on top. */
  documentTokens?: TokenValues | undefined;
  /** Width divided by height of the preview shape. Fills the available space if not set. */
  aspectRatio?: number | undefined;
  selectedId: string | null;
  onSelect: (widgetId: string | null) => void;
  onLayoutChange: (layout: Layout) => void;
  /** Renders a widget's contents. Presses never reach it. */
  renderWidget: (widget: WidgetInstance) => ReactNode;
};

const arrowDirections: Partial<Record<string, CellSize>> = {
  ArrowLeft: { columns: -1, rows: 0 },
  ArrowRight: { columns: 1, rows: 0 },
  ArrowUp: { columns: 0, rows: -1 },
  ArrowDown: { columns: 0, rows: 1 }
};

const bottomRight: ResizeHandle = { column: 1, row: 1 };

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
  onLayoutChange,
  renderWidget
}: CanvasProps) {
  const instructionsId = useId();
  const dotsRef = useRef<HTMLDivElement>(null);
  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const minSizes = new Map(page.widgets.map(widget => [widget.id, widgetMinSize(widget, layout.grid)]));

  /** Where the gesture would put the widget. May be an invalid position. */
  function targetArea({ widgetId, handle, startArea, cellWidth, cellHeight }: Gesture, x: number, y: number): Area {
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

  function place(widgetId: string, area: Area) {
    const widget = page.widgets.find(candidate => candidate.id === widgetId);

    onLayoutChange(withArea(layout, widgetId, area));
    setAnnouncement(
      `${widget ? widgetName(widget) : widgetId}: column ${area.column}, row ${area.row}, ${area.columnSpan} by ${area.rowSpan} cells.`
    );
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

  function handlePointerUp(event: PointerEvent) {
    if (gesture?.pointerId !== event.pointerId) {
      return;
    }

    const final = update(gesture, event);
    const area = targetArea(final, final.x, final.y);

    setGesture(null);

    if (!final.dragging || areasEqual(area, final.startArea)) {
      return;
    }

    if (canPlace(layout, area, final.widgetId)) {
      place(final.widgetId, area);
    } else {
      setAnnouncement('That space is taken. The widget is back where it was.');
    }
  }

  /** The browser took the pointer away (or the gesture has already ended): never commit. */
  function handlePointerLost(event: PointerEvent) {
    setGesture(current => (current?.pointerId === event.pointerId ? null : current));
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      return;
    }

    if (gesture) {
      setGesture(null);
    } else if (selectedId !== null) {
      onSelect(null);
    } else {
      return;
    }

    event.stopPropagation();
  }

  function handleWidgetKeyDown(event: KeyboardEvent, widgetId: string) {
    const direction = arrowDirections[event.key];
    const area = layout.areas[widgetId];

    if (!direction || !area || gesture || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    event.preventDefault();
    onSelect(widgetId);

    const next = event.shiftKey
      ? resizeArea(area, bottomRight, direction, layout.grid, minSizes.get(widgetId))
      : findFreeStep(layout, widgetId, direction);

    if (!next || areasEqual(next, area) || !canPlace(layout, next, widgetId)) {
      setAnnouncement(event.shiftKey ? "Can't resize any further that way." : 'No free space that way.');
      return;
    }

    place(widgetId, next);
  }

  const drag = gesture?.dragging ? { ...gesture, area: targetArea(gesture, gesture.x, gesture.y) } : null;

  return (
    <div className={styles.viewport}>
      <div
        className={clsx(mfdRoot, styles.frame)}
        style={{
          ...applyTokens(documentTokens),
          height: aspectRatio ? `min(100cqh, ${100 / aspectRatio}cqw)` : '100%',
          width: aspectRatio ? `min(100cqw, ${100 * aspectRatio}cqh)` : '100%'
        }}
      >
        {/* Keyboard and pointer events bubble up from the widgets, which are real buttons. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          aria-label={`Canvas, page ${page.name}`}
          className={styles.page}
          onContextMenu={event => {
            // A long press must not open a menu halfway through a drag.
            if (gesture) {
              event.preventDefault();
            }
          }}
          onKeyDown={handleEscape}
          onLostPointerCapture={handlePointerLost}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role='group'
          style={applyTokens(page.tokens)}
        >
          <div
            className={styles.grid}
            onPointerDown={event => {
              if (event.target === event.currentTarget && !gesture) {
                onSelect(null);
              }
            }}
            style={{
              gridTemplateColumns: `repeat(${layout.grid.columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${layout.grid.rows}, minmax(0, 1fr))`
            }}
          >
            <div
              className={styles.dots}
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
                  instructionsId={instructionsId}
                  key={widget.id}
                  lifted={dragged && !dragged.handle ? { x: dragged.x, y: dragged.y } : null}
                  onKeyDown={handleWidgetKeyDown}
                  onPointerDown={handlePointerDown}
                  onSelect={onSelect}
                  selected={widget.id === selectedId}
                  widget={widget}
                >
                  {renderWidget(widget)}
                </CanvasWidget>
              );
            })}
            {drag ? (
              <div
                className={styles.ghost}
                data-invalid={canPlace(layout, drag.area, drag.widgetId) ? undefined : ''}
                style={{
                  gridColumn: `${drag.area.column} / span ${drag.area.columnSpan}`,
                  gridRow: `${drag.area.row} / span ${drag.area.rowSpan}`
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
      <p className={styles.visuallyHidden} id={instructionsId}>
        Arrow keys move the widget, Shift and arrow keys resize it, Escape deselects it.
      </p>
      <p aria-live='polite' className={styles.visuallyHidden}>
        {announcement}
      </p>
    </div>
  );
}
