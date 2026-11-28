import type { Area, Grid, GridPoint, Layout, Page, ResizeHandle, TokenValues, WidgetInstance } from '@mfdiy/schema';

import { applyTokens, LayoutArea, LayoutGrid, mfdRoot } from '@mfdiy/instruments';
import {
  areasEqual,
  areasOverlap,
  bringToFront,
  cellAt,
  findOverlaps,
  moveArea,
  resizeArea,
  withArea
} from '@mfdiy/schema';
import { Box, Text, useSheetCover } from '@mfdiy/ui/components';
import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref
} from 'react';

import * as styles from './Canvas.css.js';
import { CanvasWidget } from './CanvasWidget.js';
import { useCanvasView, type Point } from './useCanvasView.js';
import { widgetMinSize } from './widgetInfo.js';

/** How far a pointer travels, in pixels, before a press becomes a drag. Fingers are less steady. */
const DRAG_THRESHOLD = { mouse: 4, touch: 8 };

const DOUBLE_TAP = { distance: 24, time: 400 };

/** How far one finger drags across the page before it's told that two fingers move it. */
const PAN_HINT_DISTANCE = 32;

function dragThreshold(pointerType: string): number {
  return pointerType === 'mouse' ? DRAG_THRESHOLD.mouse : DRAG_THRESHOLD.touch;
}

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

/** A press on the empty page or around it, which may become a pan. */
type BackgroundPress = {
  hinted: boolean;
  /** On an empty cell, where a tap marks a spot or lets go of the selection itself. */
  onGrid: boolean;
  onPage: boolean;
  pointerId: number;
  pointerType: string;
  x: number;
  y: number;
};

/** Moves the view from outside the canvas, e.g. from a menu (0024). */
export type CanvasView = {
  /** Zooms out until the whole page fits, centred. */
  fit: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

/** Lets the page around the canvas ask where things are on it, e.g. for a drag from outside, and move the view. */
export type CanvasHandle = CanvasView & {
  /** The grid point under a pointer, or null if it isn't over the grid. */
  gridPointAt: (clientX: number, clientY: number) => GridPoint | null;
};

export type CanvasProps = {
  /** Width divided by height of the preview shape. Fills the available space if not set. */
  aspectRatio?: number | undefined;
  /** Document-wide theme overrides; the page's own are applied on top. */
  documentTokens?: TokenValues | undefined;
  /** Where a widget is being added: marked with a plus. */
  ghost?: Area | null | undefined;
  /** Receives a `CanvasHandle`. */
  handleRef?: Ref<CanvasHandle> | undefined;
  /**
   * Shown above the page's top-left corner, at the same size whatever the zoom, e.g. a
   * `CanvasLabel`. Fitting the page makes room for it (0006, 0024).
   */
  label?: ReactNode | undefined;
  /** The layout being edited: one of the page's own. */
  layout: Layout;
  /**
   * The area a widget added at this point covers at least. Shown with a plus while hovering an empty
   * cell, whenever a click there would add one.
   */
  newWidgetArea?: ((point: GridPoint) => Area) | undefined;
  onChange: (page: Page) => void;
  /** A double tap on a widget, or around the grid (`null`); returns whether it was handled (0026). */
  onDoubleTap?: ((widgetId: string | null) => boolean) | undefined;
  /** Fires when a press on a widget becomes a move or resize, and when that ends. */
  onDragChange?: ((dragging: boolean) => void) | undefined;
  /**
   * Fires when an empty cell is tapped while nothing is selected: with a selection, the first tap
   * only lets go of it. Comes with what was used to tap.
   */
  onEmptyTap?: ((point: GridPoint, pointerType: string) => void) | undefined;
  /**
   * Fires when the space around the grid is clicked or tapped without moving: around the page, or
   * in its padding. Like clicking white space anywhere, it should let go of what's selected (0024).
   */
  onOutsideTap?: (() => void) | undefined;
  /** Fires when one finger drags across the page, which only two fingers move (0024). */
  onPanHint?: (() => void) | undefined;
  onSelect: (widgetId: string | null) => void;
  page: Page;
  /** Renders a widget's contents. Presses never reach it. */
  renderWidget: (widget: WidgetInstance) => ReactNode;
  /**
   * What to keep in view above an open sheet: the selected widget, or the cell marked to add one.
   * The view moves only when the selection or the mark changes, or a sheet opens, and only if it's
   * hidden (0024).
   */
  reveal?: Area | null | undefined;
  selectedId: string | null;
  /** The page around an entered shared subgrid, under a hatching (0026). */
  surround?: CanvasSurround | undefined;
};

export type CanvasSurround = {
  area: Area;
  content: ReactNode;
  grid: Grid;
};

/**
 * The page being edited: select, move and resize widgets on the grid, and pan and zoom around it
 * (0024). Fills any box it's given, edge to edge, and fits the page into it with room around it;
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
  onDoubleTap,
  onDragChange,
  ghost,
  newWidgetArea,
  onEmptyTap,
  onOutsideTap,
  onPanHint,
  renderWidget,
  reveal,
  handleRef,
  label,
  surround
}: CanvasProps) {
  const dotsRef = useRef<HTMLDivElement>(null);
  /** Every finger on the canvas, so a second one can turn into a pinch. */
  const touchesRef = useRef(new Map<number, Point>());
  const backgroundPressRef = useRef<BackgroundPress | null>(null);
  const lastTapRef = useRef<{ at: number; target: string | null; x: number; y: number } | null>(null);
  const view = useCanvasView({ aspectRatio, hasTouches: () => touchesRef.current.size > 0 });
  const cover = useSheetCover();

  useImperativeHandle(handleRef, () => ({
    fit: view.fit,
    zoomIn: view.zoomIn,
    zoomOut: view.zoomOut,
    gridPointAt(clientX, clientY) {
      const dots = dotsRef.current?.getBoundingClientRect();

      if (!dots || clientX < dots.left || clientX > dots.right || clientY < dots.top || clientY > dots.bottom) {
        return null;
      }

      return pointAt({ clientX, clientY }, dots);
    }
  }));
  /** Where a press on the empty grid started, if it could become a tap. */
  const emptyPressRef = useRef<{ x: number; y: number; point: GridPoint; pointerType: string } | null>(null);
  const [gesture, setGesture] = useState<Gesture | null>(null);
  /** The part of the grid under the mouse or pen, if it isn't on a widget. */
  const [hovered, setHovered] = useState<GridPoint | null>(null);

  const revealSubject = selectedId ?? (reveal ? `${reveal.column},${reveal.row}` : null);
  const [revealed, setRevealed] = useState({ cover, subject: revealSubject });
  /** Measured once the view has rendered, so it's kept until then. */
  const pendingRevealRef = useRef<Area | null>(null);

  if (revealed.cover !== cover || revealed.subject !== revealSubject) {
    setRevealed({ cover, subject: revealSubject });

    if (reveal && cover > 0) {
      pendingRevealRef.current = reveal;
    }
  }

  useLayoutEffect(() => {
    const area = pendingRevealRef.current;
    const dots = dotsRef.current?.getBoundingClientRect();

    pendingRevealRef.current = null;

    if (!area || !dots) {
      return;
    }

    const cellWidth = dots.width / layout.grid.columns;
    const cellHeight = dots.height / layout.grid.rows;

    view.reveal(
      {
        bottom: dots.top + (area.row - 1 + area.rowSpan) * cellHeight,
        left: dots.left + (area.column - 1) * cellWidth,
        right: dots.left + (area.column - 1 + area.columnSpan) * cellWidth,
        top: dots.top + (area.row - 1) * cellHeight
      },
      window.innerHeight * (1 - cover)
    );
  });

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
    if (gesture || view.driving() || event.button !== 0 || !startArea || !dots) {
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
      threshold: dragThreshold(event.pointerType),
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
      onDragChange?.(true);
      onSelect(next.widgetId);
    }

    setGesture(next);
  }

  /** The nearest quarter or three quarters of a cell: where things go never depends on more than that. */
  function pointAt(event: { clientX: number; clientY: number }, dots: DOMRect): GridPoint {
    return {
      x: snapAxis(((event.clientX - dots.left) / dots.width) * layout.grid.columns, layout.grid.columns),
      y: snapAxis(((event.clientY - dots.top) / dots.height) * layout.grid.rows, layout.grid.rows)
    };
  }

  /** The gaps between widgets aren't empty cells. */
  function isEmpty(point: GridPoint): boolean {
    const cell = cellAt(point, layout.grid);

    return !Object.values(layout.areas).some(area => areasOverlap(area, cell));
  }

  function handleHover(event: PointerEvent) {
    const dots = dotsRef.current?.getBoundingClientRect();
    // Fingers don't hover. Over a widget, the target is the widget.
    const hovering = dots && event.pointerType !== 'touch' && event.target === event.currentTarget;
    const point = hovering && !view.driving() ? pointAt(event, dots) : null;

    if (point?.x !== hovered?.x || point?.y !== hovered?.y) {
      setHovered(point);
    }
  }

  function handleEmptyPointerDown(event: PointerEvent) {
    const dots = dotsRef.current?.getBoundingClientRect();

    emptyPressRef.current = null;

    if (event.target !== event.currentTarget || gesture || view.driving() || !dots) {
      return;
    }

    if (event.isPrimary && event.button === 0) {
      emptyPressRef.current = {
        x: event.clientX,
        y: event.clientY,
        // Not from the click: those are in whole pixels, so it could differ from what hovering showed.
        point: pointAt(event, dots),
        pointerType: event.pointerType
      };
    }
  }

  /**
   * On click rather than when the pointer is released: touch screens click after that, on whatever
   * has appeared under the finger by then. Not on press either, so the page can be dragged to pan
   * without losing the selection.
   */
  function handleEmptyClick(event: MouseEvent) {
    const press = emptyPressRef.current;

    emptyPressRef.current = null;

    if (!press || event.target !== event.currentTarget) {
      return;
    }

    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) >= dragThreshold(press.pointerType)) {
      return;
    }

    if (selectedId !== null) {
      onSelect(null);
    } else if (isEmpty(press.point)) {
      onEmptyTap?.(press.point, press.pointerType);
    }
  }

  /** Hands the pointers to the view, letting go of any press that hasn't become a drag. */
  function startPan(pointers: [number, Point][]) {
    emptyPressRef.current = null;
    backgroundPressRef.current = null;
    setGesture(null);
    setHovered(null);
    view.drive(pointers);
  }

  /**
   * Runs before anything on the canvas sees the press: a second finger, before the first has
   * started dragging a widget, pinches instead; the middle button pans from anywhere.
   */
  function handleViewportPointerDownCapture(event: PointerEvent<HTMLElement>) {
    const point = { x: event.clientX, y: event.clientY };

    if (event.pointerType === 'touch') {
      touchesRef.current.set(event.pointerId, point);
    }

    if (view.driving()) {
      if (event.pointerType === 'touch') {
        view.addDriver(event.pointerId, point);
      }

      event.stopPropagation();

      return;
    }

    if (event.pointerType === 'touch' && touchesRef.current.size >= 2 && !gesture?.dragging) {
      startPan([...touchesRef.current]);
      event.stopPropagation();

      return;
    }

    if (event.pointerType !== 'touch' && event.button === 1) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      startPan([[event.pointerId, point]]);
      event.stopPropagation();
    }
  }

  function handleViewportPointerDown(event: PointerEvent<HTMLElement>) {
    const target = event.target instanceof Element ? event.target : null;

    if (gesture || view.driving() || !event.isPrimary || event.button !== 0 || !target) {
      return;
    }

    if (target.closest('[data-canvas="widget"], [data-canvas="label"]')) {
      return;
    }

    backgroundPressRef.current = {
      hinted: false,
      onGrid: target.closest('[data-canvas="grid"]') !== null,
      onPage: target.closest('[data-canvas="frame"]') !== null,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      x: event.clientX,
      y: event.clientY
    };
  }

  function handleViewportPointerMoveCapture(event: PointerEvent<HTMLElement>) {
    if (touchesRef.current.has(event.pointerId)) {
      touchesRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
  }

  /** A mouse or pen pans by dragging the page or around it; one finger only around it. */
  function handleViewportPointerMove(event: PointerEvent<HTMLElement>) {
    if (view.driving(event.pointerId)) {
      view.moveDriver(event.pointerId, { x: event.clientX, y: event.clientY });

      return;
    }

    const press = backgroundPressRef.current;

    if (press?.pointerId !== event.pointerId) {
      return;
    }

    const distance = Math.hypot(event.clientX - press.x, event.clientY - press.y);

    if (press.pointerType === 'touch' && press.onPage) {
      if (!press.hinted && distance >= PAN_HINT_DISTANCE && touchesRef.current.size === 1) {
        press.hinted = true;
        onPanHint?.();
      }

      return;
    }

    if (distance >= dragThreshold(press.pointerType)) {
      event.currentTarget.setPointerCapture(event.pointerId);
      startPan([[event.pointerId, { x: press.x, y: press.y }]]);
      view.moveDriver(event.pointerId, { x: event.clientX, y: event.clientY });
    }
  }

  /** A still press off the grid is a click in white space. */
  function handleViewportPointerUp(event: PointerEvent<HTMLElement>) {
    const press = backgroundPressRef.current;

    if (
      press?.pointerId === event.pointerId &&
      !press.onGrid &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) < dragThreshold(press.pointerType) &&
      !doubleTapped(null, event)
    ) {
      onOutsideTap?.();
    }

    handleViewportPointerEnd(event);
  }

  function handleViewportPointerEnd(event: PointerEvent<HTMLElement>) {
    touchesRef.current.delete(event.pointerId);

    if (backgroundPressRef.current?.pointerId === event.pointerId) {
      backgroundPressRef.current = null;
    }

    if (view.driving(event.pointerId)) {
      view.endDriver(event.pointerId);
    }
  }

  function doubleTapped(target: string | null, event: PointerEvent): boolean {
    const last = lastTapRef.current;
    const double =
      last !== null &&
      last.target === target &&
      event.timeStamp - last.at < DOUBLE_TAP.time &&
      Math.hypot(event.clientX - last.x, event.clientY - last.y) < DOUBLE_TAP.distance;

    lastTapRef.current = double ? null : { at: event.timeStamp, target, x: event.clientX, y: event.clientY };

    return double && (onDoubleTap?.(target) ?? false);
  }

  /**
   * Selects the pressed widget. Pressing the selected widget again selects the next one underneath,
   * so widgets hidden behind others can be reached.
   */
  function handleTap(widgetId: string, event: PointerEvent) {
    const dots = dotsRef.current?.getBoundingClientRect();

    if (doubleTapped(widgetId, event)) {
      return;
    }

    if (widgetId !== selectedId || !dots) {
      onSelect(widgetId);
      return;
    }

    const cell = cellAt(pointAt(event, dots), layout.grid);

    const stack = page.widgets
      .map(widget => widget.id)
      .filter(id => {
        const area = layout.areas[id];

        return area && areasOverlap(area, cell);
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

    if (final.dragging) {
      onDragChange?.(false);
    }

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
    if (gesture?.pointerId === event.pointerId && gesture.dragging) {
      onDragChange?.(false);
    }

    setGesture(current => (current?.pointerId === event.pointerId ? null : current));
  }

  const drag = gesture?.dragging ? { ...gesture, area: targetArea(gesture) } : null;
  // Only where a click would add a widget: with a selection, it only lets go of that.
  const invitation =
    hovered && !gesture && !view.panning && !ghost && selectedId === null && onEmptyTap && isEmpty(hovered)
      ? (newWidgetArea?.(hovered) ?? null)
      : null;
  const marked = ghost ?? invitation;
  const overlaps = findOverlaps(drag ? withArea(layout, drag.widgetId, drag.area) : layout);
  const editable = (
    <LayoutGrid
      className={styles.grid}
      cursor={view.panning ? 'grabbing' : invitation ? 'pointer' : 'grab'}
      data-canvas='grid'
      grid={layout.grid}
      height='full'
      onClick={handleEmptyClick}
      onPointerDown={handleEmptyPointerDown}
      onPointerLeave={() => setHovered(null)}
      onPointerMove={handleHover}
      position='relative'
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
      {drag ? <Ghost area={drag.area} /> : ghost ? <Ghost area={ghost} /> : null}
      {invitation ? <Ghost area={invitation} quiet /> : null}
      {marked ? <Plus area={marked} /> : null}
      {overlaps.map(({ widgetIds, area }) => (
        // Striped and dashed as well as red, so it doesn't rely on colour alone.
        <LayoutArea
          area={area}
          backgroundImage='canvas.overlap'
          borderColor='canvas.overlap'
          borderStyle='dashed'
          borderWidth='edit'
          boxShadow='canvas.halo'
          data-canvas='overlap'
          key={widgetIds.join(' ')}
          pointerEvents='none'
          position='relative'
          zIndex='3'
        />
      ))}
    </LayoutGrid>
  );

  return (
    <Box
      cursor={view.panning ? 'grabbing' : 'grab'}
      data-canvas='viewport'
      height='full'
      isolation='isolate'
      minHeight='none'
      minWidth='none'
      onLostPointerCapture={event => {
        // Only its own: capture moving from a widget or the grid to the viewport mustn't end a pan.
        if (event.target === event.currentTarget) {
          handleViewportPointerEnd(event);
        }
      }}
      onPointerCancelCapture={handleViewportPointerEnd}
      onPointerDown={handleViewportPointerDown}
      onPointerDownCapture={handleViewportPointerDownCapture}
      onPointerMove={handleViewportPointerMove}
      onPointerMoveCapture={handleViewportPointerMoveCapture}
      onPointerUpCapture={handleViewportPointerUp}
      overflow='hidden'
      overscrollBehavior='none'
      position='relative'
      ref={view.viewportRef}
      touchAction='none'
      userSelect='none'
      width='full'
    >
      {label ? (
        <Box
          cursor='default'
          data-canvas='label'
          left='none'
          overflow='hidden'
          position='absolute'
          ref={view.labelRef}
          top='none'
        >
          {label}
        </Box>
      ) : null}
      <Box
        className={mfdRoot}
        containerType='size'
        cssVariables={applyTokens(documentTokens)}
        data-canvas='frame'
        left='none'
        position='absolute'
        ref={view.frameRef}
        top='none'
      >
        <Box
          aria-label={`Page ${page.name}`}
          className={styles.page}
          cssVariables={applyTokens(page.tokens)}
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
          touchAction='none'
          userSelect='none'
        >
          {surround ? <Surround surround={surround}>{editable}</Surround> : editable}
          {onEmptyTap && !surround && page.widgets.length === 0 && !marked ? (
            <Box
              alignItems='center'
              display='flex'
              inset='none'
              justifyContent='center'
              pointerEvents='none'
              position='absolute'
            >
              <Box backgroundColor='surface.raised' color='text' padding='4x'>
                <Text variant='body'>Tap anywhere to add a widget</Text>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

type SurroundProps = {
  children: ReactNode;
  surround: CanvasSurround;
};

function Surround({ children, surround }: SurroundProps) {
  return (
    <Box height='full' position='relative'>
      <LayoutGrid className={styles.grid} grid={surround.grid} height='full' isolation='isolate' pointerEvents='none'>
        {surround.content}
      </LayoutGrid>
      <Box backgroundImage='canvas.shared' className={styles.cover} data-canvas='cover' position='absolute' />
      <LayoutGrid className={styles.grid} grid={surround.grid} inset='none' pointerEvents='none' position='absolute'>
        <LayoutArea
          area={surround.area}
          className={styles.content}
          minHeight='none'
          minWidth='none'
          pointerEvents='auto'
        >
          {children}
        </LayoutArea>
      </LayoutGrid>
    </Box>
  );
}

type GhostProps = {
  area: Area;
  /** Only an outline, for what follows the pointer around. */
  quiet?: boolean;
};

function Ghost({ area, quiet = false }: GhostProps) {
  return (
    <LayoutArea
      area={area}
      backgroundColor={quiet ? 'transparent' : 'canvas.ghost'}
      borderColor='canvas.edit'
      borderStyle={quiet ? 'dashed' : 'solid'}
      borderWidth={quiet ? 'hairline' : 'edit'}
      boxShadow={quiet ? 'none' : 'canvas.halo'}
      data-canvas='ghost'
      pointerEvents='none'
      position='relative'
      // Above a lifted widget, which would otherwise hide it.
      zIndex='3'
    />
  );
}

/** In the middle of an area, shrinking with it. */
function Plus({ area }: { area: Area }) {
  return (
    <LayoutArea
      alignItems='center'
      area={area}
      containerType='size'
      display='flex'
      justifyContent='center'
      pointerEvents='none'
      position='relative'
      zIndex='3'
    >
      <Box aria-hidden className={styles.plus} color='canvas.edit' data-canvas='plus' tagName='svg' viewBox='0 0 24 24'>
        <Box d='M12 5v14M5 12h14' fill='none' stroke='currentColor' strokeWidth='2' tagName='path' />
      </Box>
    </LayoutArea>
  );
}

/** The middle of the half cell a distance falls in, limited to the grid. */
function snapAxis(distance: number, cells: number): number {
  return Math.min(Math.max(Math.floor(distance * 2) / 2 + 0.25, 0.25), cells - 0.25);
}
