import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export type Point = { x: number; y: number };

/** A box on the screen, in client pixels. */
export type ScreenRect = { bottom: number; left: number; right: number; top: number };

/**
 * What the canvas shows: how far it's zoomed in from fitting the screen, and which point of the page
 * (as fractions of its width and height) is in the middle of the screen. Kept relative, so it
 * survives the screen changing size.
 */
type View = { focusX: number; focusY: number; scale: number };

/** Where the page sits in the viewport, in pixels. */
type Placement = { height: number; left: number; top: number; width: number };

type Size = {
  fitHeight: number;
  fitWidth: number;
  height: number;
  /** The height of the label above the page. */
  label: number;
  width: number;
};

/** The pointers moving the view, and where the gesture stood when they last changed. */
type Drive = {
  anchor: Point;
  baseCentroid: Point;
  baseDistance: number;
  baseScale: number;
  minScale: number;
  pointers: Map<number, Point>;
  /** The view before the elastic limits, in pixels, so a gesture past a limit resumes smoothly. */
  raw: { left: number; scale: number; top: number };
  samples: { point: Point; time: number }[];
};

/** Room around the page when it fits the screen, so handles on its edges stay in view. */
const FIT_MARGIN = 16;

const MAX_SCALE = 6;

const MIN_SCALE = 0.5;

/** How much of the viewport the page always covers, along each axis, unless it's smaller. */
const MIN_COVER = 0.25;

/** How quickly a flung view slows down: iOS's time constant for scrolling. */
const MOMENTUM_DECAY_MS = 325;

/** Pointer movement older than this doesn't count towards a fling. */
const VELOCITY_WINDOW_MS = 100;

/** Slower than this, in pixels per millisecond, and a release doesn't fling. */
const MIN_FLING_SPEED = 0.05;

const SPRING_MS = 90;

const TWEEN_MS = 260;

/** Zoom per pixel of wheel movement with Ctrl or ⌘ (a trackpad pinch arrives as that). */
const WHEEL_ZOOM_RATE = 0.01;

/** Caps one wheel event, so a mouse's notch zooms about as much as a few frames of pinching. */
const MAX_WHEEL_ZOOM_DELTA = 25;

const BUTTON_ZOOM_STEP = 1.5;

const LINE_HEIGHT = 16;

/** The page at its fitting size, leaving room for the margin all round and its label on top. */
function fitSize(width: number, height: number, aspectRatio: number | undefined, label: number): Size {
  const roomWidth = Math.max(width - FIT_MARGIN * 2, 1);
  const roomHeight = Math.max(height - FIT_MARGIN * 2 - label, 1);

  if (!aspectRatio) {
    return { fitHeight: roomHeight, fitWidth: roomWidth, height, label, width };
  }

  const fitWidth = Math.min(roomWidth, roomHeight * aspectRatio);

  return { fitHeight: fitWidth / aspectRatio, fitWidth, height, label, width };
}

/** The page and its label together, centred. */
function fitView(size: Size): View {
  const left = (size.width - size.fitWidth) / 2;
  const top = (size.height - size.fitHeight - size.label) / 2 + size.label;

  return viewOf(left, top, 1, size);
}

function place(view: View, size: Size): Placement {
  const width = size.fitWidth * view.scale;
  const height = size.fitHeight * view.scale;

  return { height, left: size.width / 2 - view.focusX * width, top: size.height / 2 - view.focusY * height, width };
}

function viewOf(left: number, top: number, scale: number, size: Size): View {
  const width = size.fitWidth * scale;
  const height = size.fitHeight * scale;

  return { focusX: (size.width / 2 - left) / width, focusY: (size.height / 2 - top) / height, scale };
}

/** Where the page's leading edge may go along one axis, so it keeps covering enough of the viewport. */
function axisBounds(length: number, room: number): [number, number] {
  const cover = Math.min(room * MIN_COVER, length);

  return [cover - length, room - cover];
}

function clamp(value: number, [min, max]: readonly [number, number]): number {
  return Math.min(Math.max(value, min), max);
}

/** Past a limit, the view follows with growing resistance, like a scroll view's edge. */
function rubber(value: number, [min, max]: readonly [number, number], room: number): number {
  const stretch = (distance: number) => (1 - 1 / ((distance * 0.55) / room + 1)) * room;

  return value < min ? min - stretch(min - value) : value > max ? max + stretch(value - max) : value;
}

/** The same for zoom, in proportion rather than distance. */
function rubberScale(scale: number, [min, max]: readonly [number, number]): number {
  const stretch = (ratio: number) => Math.exp(Math.log(ratio) * 0.35);

  return scale < min ? min / stretch(min / scale) : scale > max ? max * stretch(scale / max) : scale;
}

function centroid(points: Iterable<Point>): Point {
  const all = [...points];

  return {
    x: all.reduce((sum, point) => sum + point.x, 0) / all.length,
    y: all.reduce((sum, point) => sum + point.y, 0) / all.length
  };
}

function spread(points: Iterable<Point>): number {
  const [a, b] = [...points];

  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
}

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select') !== null)
  );
}

type SafariGestureEvent = UIEvent & { clientX: number; clientY: number; scale: number };

export type CanvasViewOptions = {
  /** Width divided by height of the preview shape. Fills the viewport if not set. */
  aspectRatio?: number | undefined;
  /** Whether touch pointers are on the canvas: Safari reports their pinch twice, as a gesture too. */
  hasTouches: () => boolean;
};

/**
 * Pans and zooms the canvas (0024): with fingers, the page stays attached to them; with a mouse,
 * it's grabbed; the wheel pans and, with Ctrl or ⌘, zooms at the pointer; `+`, `−` and `0` zoom.
 * It writes the page's size and position straight to the frame, and the label above it, so moving
 * the view never renders. Fitting shows the page and its label; the view starts there, and again
 * when the shape changes.
 */
export function useCanvasView({ aspectRatio, hasTouches }: CanvasViewOptions) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>({ focusX: 0.5, focusY: 0.5, scale: 1 });
  /** Until the view is moved, it stays fitted as the screen or the label changes size. */
  const atFitRef = useRef(true);
  const sizeRef = useRef<Size | null>(null);
  const driveRef = useRef<Drive | null>(null);
  const frameRequestRef = useRef<number | null>(null);
  const [panning, setPanning] = useState(false);

  function apply(view: View) {
    const size = sizeRef.current;
    const frame = frameRef.current;

    viewRef.current = view;

    if (!size || !frame) {
      return;
    }

    const { height, left, top, width } = place(view, size);
    const label = labelRef.current;

    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    frame.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;

    if (label) {
      label.style.maxWidth = `${Math.max(width, 0)}px`;
      label.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top - size.label)}px, 0)`;
    }
  }

  function stopAnimation() {
    if (frameRequestRef.current !== null) {
      cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = null;
    }
  }

  function animate(step: (elapsed: number, delta: number) => boolean) {
    stopAnimation();

    let start: number | null = null;
    let last = 0;

    const tick = (time: number) => {
      start ??= time;

      const going = step(time - start, Math.min(time - (last || time), 32));

      last = time;
      frameRequestRef.current = going ? requestAnimationFrame(tick) : null;
    };

    frameRequestRef.current = requestAnimationFrame(tick);
  }

  function viewportOrigin(): Point {
    const rect = viewportRef.current?.getBoundingClientRect();

    return { x: rect?.left ?? 0, y: rect?.top ?? 0 };
  }

  function bounds(size: Size, scale: number) {
    return {
      left: axisBounds(size.fitWidth * scale, size.width),
      top: axisBounds(size.fitHeight * scale, size.height)
    };
  }

  function clampView(view: View, minScale: number): View {
    const size = sizeRef.current;

    if (!size) {
      return view;
    }

    const scale = clamp(view.scale, [minScale, MAX_SCALE]);
    const placed = place({ ...view, scale }, size);
    const limits = bounds(size, scale);

    return viewOf(clamp(placed.left, limits.left), clamp(placed.top, limits.top), scale, size);
  }

  /** Zooms by a factor, keeping the page point under `at` (viewport pixels) where it is. */
  function zoomedAt(view: View, factor: number, at: Point, minScale: number): View {
    const size = sizeRef.current;

    if (!size) {
      return view;
    }

    const placed = place(view, size);
    const scale = clamp(view.scale * factor, [minScale, MAX_SCALE]);
    const anchorX = (at.x - placed.left) / placed.width;
    const anchorY = (at.y - placed.top) / placed.height;

    return clampView(
      viewOf(at.x - anchorX * size.fitWidth * scale, at.y - anchorY * size.fitHeight * scale, scale, size),
      minScale
    );
  }

  function tweenTo(target: View) {
    const from = viewRef.current;

    if (reducedMotion()) {
      stopAnimation();
      apply(target);

      return;
    }

    animate(elapsed => {
      const progress = Math.min(elapsed / TWEEN_MS, 1);
      const eased = 1 - (1 - progress) ** 3;

      apply({
        focusX: from.focusX + (target.focusX - from.focusX) * eased,
        focusY: from.focusY + (target.focusY - from.focusY) * eased,
        scale: from.scale * (target.scale / from.scale) ** eased
      });

      return progress < 1;
    });
  }

  function rebase(drive: Drive) {
    const size = sizeRef.current;

    if (!size) {
      return;
    }

    const base = centroid(drive.pointers.values());
    const width = size.fitWidth * drive.raw.scale;
    const height = size.fitHeight * drive.raw.scale;

    drive.anchor = { x: (base.x - drive.raw.left) / width, y: (base.y - drive.raw.top) / height };
    drive.baseCentroid = base;
    drive.baseDistance = spread(drive.pointers.values());
    drive.baseScale = drive.raw.scale;
    drive.samples = [{ point: base, time: performance.now() }];
  }

  function toViewport(point: Point): Point {
    const origin = viewportOrigin();

    return { x: point.x - origin.x, y: point.y - origin.y };
  }

  /** Starts moving the view with these pointers, in client pixels. */
  function drive(pointers: [number, Point][]) {
    const size = sizeRef.current;

    if (!size || pointers.length === 0) {
      return;
    }

    stopAnimation();
    atFitRef.current = false;

    const placed = place(viewRef.current, size);
    const next: Drive = {
      anchor: { x: 0, y: 0 },
      baseCentroid: { x: 0, y: 0 },
      baseDistance: 0,
      baseScale: viewRef.current.scale,
      minScale: Math.min(MIN_SCALE, viewRef.current.scale),
      pointers: new Map(pointers.slice(0, 2).map(([id, point]) => [id, toViewport(point)])),
      raw: { left: placed.left, scale: viewRef.current.scale, top: placed.top },
      samples: []
    };

    rebase(next);
    driveRef.current = next;
    setPanning(true);
  }

  /** A second finger joins the gesture, turning a pan into a pinch. */
  function addDriver(pointerId: number, point: Point): boolean {
    const current = driveRef.current;

    if (!current || current.pointers.size >= 2) {
      return false;
    }

    current.pointers.set(pointerId, toViewport(point));
    rebase(current);

    return true;
  }

  function moveDriver(pointerId: number, point: Point) {
    const current = driveRef.current;
    const size = sizeRef.current;

    if (!current || !size || !current.pointers.has(pointerId)) {
      return;
    }

    current.pointers.set(pointerId, toViewport(point));

    const middle = centroid(current.pointers.values());
    const distance = spread(current.pointers.values());
    const rawScale =
      current.pointers.size === 2 && current.baseDistance > 0
        ? current.baseScale * (distance / current.baseDistance)
        : current.baseScale;
    const scale = rubberScale(rawScale, [current.minScale, MAX_SCALE]);
    const width = size.fitWidth * scale;
    const height = size.fitHeight * scale;
    const limits = bounds(size, scale);
    const now = performance.now();

    current.raw = {
      left: middle.x - current.anchor.x * size.fitWidth * rawScale,
      scale: rawScale,
      top: middle.y - current.anchor.y * size.fitHeight * rawScale
    };
    current.samples = [...current.samples, { point: middle, time: now }].filter(
      sample => now - sample.time <= VELOCITY_WINDOW_MS
    );

    apply(
      viewOf(
        rubber(middle.x - current.anchor.x * width, limits.left, size.width),
        rubber(middle.y - current.anchor.y * height, limits.top, size.height),
        scale,
        size
      )
    );
  }

  /** After letting go: a fling glides on and slows down; past a limit, the view springs back. */
  function release(drive: Drive) {
    const size = sizeRef.current;

    if (!size) {
      return;
    }

    const first = drive.samples[0];
    const last = drive.samples.at(-1);
    const elapsed = first && last ? last.time - first.time : 0;
    const fling =
      first && last && elapsed > 0 && performance.now() - last.time < 50
        ? { x: (last.point.x - first.point.x) / elapsed, y: (last.point.y - first.point.y) / elapsed }
        : { x: 0, y: 0 };
    const minScale = drive.minScale;
    const scaleLimits = [minScale, MAX_SCALE] as const;

    if (viewRef.current.scale < minScale || viewRef.current.scale > MAX_SCALE) {
      const at = centroid(drive.pointers.size > 0 ? drive.pointers.values() : [drive.baseCentroid]);

      tweenTo(
        zoomedAt(viewRef.current, clamp(viewRef.current.scale, scaleLimits) / viewRef.current.scale, at, minScale)
      );

      return;
    }

    if (reducedMotion()) {
      apply(clampView(viewRef.current, minScale));

      return;
    }

    let velocity = Math.hypot(fling.x, fling.y) >= MIN_FLING_SPEED ? fling : { x: 0, y: 0 };

    animate((_, delta) => {
      const view = viewRef.current;
      const placed = place(view, size);
      const limits = bounds(size, view.scale);
      const decay = Math.exp(-delta / MOMENTUM_DECAY_MS);
      const spring = 1 - Math.exp(-delta / SPRING_MS);

      const axis = (position: number, speed: number, range: readonly [number, number]) => {
        if (position < range[0] || position > range[1]) {
          const target = clamp(position, range);

          return {
            position: position + (target - position) * spring,
            speed: 0,
            settled: Math.abs(target - position) < 0.5
          };
        }

        const moved = position + speed * delta;
        const inside = clamp(moved, range);

        return {
          position: inside,
          speed: inside === moved ? speed * decay : 0,
          settled: Math.abs(speed * decay) < 0.01
        };
      };

      const x = axis(placed.left, velocity.x, limits.left);
      const y = axis(placed.top, velocity.y, limits.top);

      velocity = { x: x.speed, y: y.speed };
      apply(viewOf(x.position, y.position, view.scale, size));

      return !(x.settled && y.settled);
    });
  }

  function endDriver(pointerId: number) {
    const current = driveRef.current;

    if (!current?.pointers.delete(pointerId)) {
      return;
    }

    if (current.pointers.size > 0) {
      rebase(current);

      return;
    }

    driveRef.current = null;
    setPanning(false);
    release(current);
  }

  function driving(pointerId?: number): boolean {
    const current = driveRef.current;

    return pointerId === undefined ? current !== null : (current?.pointers.has(pointerId) ?? false);
  }

  function zoomBy(factor: number) {
    const size = sizeRef.current;

    atFitRef.current = false;

    if (size) {
      tweenTo(
        zoomedAt(
          viewRef.current,
          factor,
          { x: size.width / 2, y: size.height / 2 },
          Math.min(MIN_SCALE, viewRef.current.scale)
        )
      );
    }
  }

  function fit() {
    const size = sizeRef.current;

    atFitRef.current = true;

    if (size) {
      tweenTo(fitView(size));
    }
  }

  /**
   * Brings a box on the page into the part of the viewport above `coverTop` (client pixels), e.g.
   * where a sheet starts. Moves only if it isn't fully in view there, and then centres it, zooming
   * out only if it doesn't fit; never in.
   */
  function reveal(target: ScreenRect, coverTop: number) {
    const size = sizeRef.current;

    if (!size || driveRef.current) {
      return;
    }

    const origin = viewportOrigin();
    const room = {
      bottom: Math.min(size.height, coverTop - origin.y),
      left: 0,
      right: size.width,
      top: 0
    };
    const box = {
      bottom: target.bottom - origin.y,
      left: target.left - origin.x,
      right: target.right - origin.x,
      top: target.top - origin.y
    };

    if (room.bottom - room.top <= FIT_MARGIN * 2) {
      return;
    }

    if (box.left >= room.left && box.right <= room.right && box.top >= room.top && box.bottom <= room.bottom) {
      return;
    }

    const view = viewRef.current;
    const placed = place(view, size);
    const shrink = Math.min(
      1,
      (room.right - room.left - FIT_MARGIN * 2) / (box.right - box.left),
      (room.bottom - room.top - FIT_MARGIN * 2) / (box.bottom - box.top)
    );
    const scale = view.scale * shrink;
    const middle = {
      x: ((box.left + box.right) / 2 - placed.left) / placed.width,
      y: ((box.top + box.bottom) / 2 - placed.top) / placed.height
    };
    const left = (room.left + room.right) / 2 - middle.x * size.fitWidth * scale;
    const top = (room.top + room.bottom) / 2 - middle.y * size.fitHeight * scale;

    atFitRef.current = false;
    tweenTo(clampView(viewOf(left, top, scale, size), Math.min(MIN_SCALE, scale)));
  }

  useLayoutEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    atFitRef.current = true;

    function measure() {
      const rect = viewport?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const size = fitSize(rect.width, rect.height, aspectRatio, labelRef.current?.offsetHeight ?? 0);

      sizeRef.current = size;

      if (atFitRef.current) {
        stopAnimation();
        apply(fitView(size));
      } else {
        apply(viewRef.current);
      }
    }

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(viewport);

    if (labelRef.current) {
      observer.observe(labelRef.current);
    }

    return () => observer.disconnect();
  }, [aspectRatio]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    function handleWheel(event: WheelEvent) {
      const size = sizeRef.current;

      event.preventDefault();

      if (!size || driveRef.current) {
        return;
      }

      stopAnimation();
      atFitRef.current = false;

      const unit = event.deltaMode === 1 ? LINE_HEIGHT : event.deltaMode === 2 ? size.height : 1;
      const origin = viewportOrigin();

      if (event.ctrlKey || event.metaKey) {
        const delta = clamp(event.deltaY * unit, [-MAX_WHEEL_ZOOM_DELTA, MAX_WHEEL_ZOOM_DELTA]);
        const view = viewRef.current;

        apply(
          zoomedAt(
            view,
            Math.exp(-delta * WHEEL_ZOOM_RATE),
            { x: event.clientX - origin.x, y: event.clientY - origin.y },
            Math.min(MIN_SCALE, view.scale)
          )
        );

        return;
      }

      const sideways = event.shiftKey && event.deltaX === 0;
      const dx = (sideways ? event.deltaY : event.deltaX) * unit;
      const dy = (sideways ? 0 : event.deltaY) * unit;
      const placed = place(viewRef.current, size);

      apply(
        clampView(
          viewOf(placed.left - dx, placed.top - dy, viewRef.current.scale, size),
          Math.min(MIN_SCALE, viewRef.current.scale)
        )
      );
    }

    let gestureScale = 1;

    function handleGestureStart(event: Event) {
      event.preventDefault();
      gestureScale = 1;
    }

    function handleGestureChange(event: Event) {
      const gesture = event as SafariGestureEvent;

      event.preventDefault();

      if (hasTouches() || driveRef.current) {
        return;
      }

      const origin = viewportOrigin();
      const view = viewRef.current;

      stopAnimation();
      atFitRef.current = false;
      apply(
        zoomedAt(
          view,
          gesture.scale / gestureScale,
          { x: gesture.clientX - origin.x, y: gesture.clientY - origin.y },
          Math.min(MIN_SCALE, view.scale)
        )
      );
      gestureScale = gesture.scale;
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('gesturestart', handleGestureStart);
    viewport.addEventListener('gesturechange', handleGestureChange);

    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('gesturestart', handleGestureStart);
      viewport.removeEventListener('gesturechange', handleGestureChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) {
        return;
      }

      if (event.key === '+' || event.key === '=') {
        zoomBy(BUTTON_ZOOM_STEP);
      } else if (event.key === '-' || event.key === '_') {
        zoomBy(1 / BUTTON_ZOOM_STEP);
      } else if (event.key === '0') {
        fit();
      } else {
        return;
      }

      event.preventDefault();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => stopAnimation, []);

  return {
    addDriver,
    drive,
    driving,
    endDriver,
    fit,
    frameRef,
    labelRef,
    moveDriver,
    panning,
    reveal,
    viewportRef,
    zoomIn: () => zoomBy(BUTTON_ZOOM_STEP),
    zoomOut: () => zoomBy(1 / BUTTON_ZOOM_STEP)
  };
}
