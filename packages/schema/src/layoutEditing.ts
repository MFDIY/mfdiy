import type { Area, Grid, Layout, Page, WidgetInstance } from './document.js';

import { areasOverlap } from './layout.js';

/*
 * Pure layout edits for the builder: every function returns a new value and knows nothing about
 * pixels, pointers or React. See docs/decisions/0006.
 */

/** The grid a new page starts with. */
export const DEFAULT_GRID: Grid = { columns: 24, rows: 16 };

/** A size, or a distance to move or resize by, in whole cells. */
export type CellSize = { columns: number; rows: number };

const SINGLE_CELL: CellSize = { columns: 1, rows: 1 };

/**
 * The edge or corner being dragged: -1 is the left / top edge, 1 the right / bottom edge, and 0
 * leaves that axis alone.
 */
export type ResizeHandle = { column: -1 | 0 | 1; row: -1 | 0 | 1 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function areasEqual(a: Area, b: Area): boolean {
  return a.column === b.column && a.row === b.row && a.columnSpan === b.columnSpan && a.rowSpan === b.rowSpan;
}

/** Moves an area, stopping at the edges of the grid. */
export function moveArea(area: Area, offset: CellSize, grid: Grid): Area {
  return {
    ...area,
    column: clamp(area.column + offset.columns, 1, grid.columns - area.columnSpan + 1),
    row: clamp(area.row + offset.rows, 1, grid.rows - area.rowSpan + 1)
  };
}

/** New start and span of one axis after dragging one of its edges by `offset` cells. */
function resizeAxis(start: number, span: number, edge: -1 | 0 | 1, offset: number, size: number, min: number) {
  const end = start + span - 1;
  // A widget that is already smaller than its minimum may stay that size, but not shrink further.
  const minSpan = Math.min(min, span);

  if (edge === -1) {
    const newStart = clamp(start + offset, 1, end - minSpan + 1);

    return { start: newStart, span: end - newStart + 1 };
  }

  if (edge === 1) {
    return { start, span: clamp(end + offset, start + minSpan - 1, size) - start + 1 };
  }

  return { start, span };
}

/**
 * Resizes an area by dragging one of its edges or corners. The opposite side stays put, and the
 * result stays within the grid and at or above `minSize`.
 */
export function resizeArea(
  area: Area,
  handle: ResizeHandle,
  offset: CellSize,
  grid: Grid,
  minSize: CellSize = SINGLE_CELL
): Area {
  const column = resizeAxis(area.column, area.columnSpan, handle.column, offset.columns, grid.columns, minSize.columns);
  const row = resizeAxis(area.row, area.rowSpan, handle.row, offset.rows, grid.rows, minSize.rows);

  return { column: column.start, row: row.start, columnSpan: column.span, rowSpan: row.span };
}

/** Scales one axis by its edges, so areas that touched before still touch and never overlap. */
function scaleAxis(start: number, span: number, from: number, to: number) {
  const first = Math.round(((start - 1) * to) / from);
  const last = Math.round(((start - 1 + span) * to) / from);

  return { start: first + 1, span: last - first };
}

/** The free position nearest to `wanted` for an area of that size, if there is one. */
function nearestFreeArea(wanted: Area, grid: Grid, placed: readonly Area[]): Area | undefined {
  let best: Area | undefined;
  let bestDistance = Infinity;

  for (let row = 1; row <= grid.rows - wanted.rowSpan + 1; row++) {
    for (let column = 1; column <= grid.columns - wanted.columnSpan + 1; column++) {
      const candidate = { ...wanted, column, row };
      const distance = (column - wanted.column) ** 2 + (row - wanted.row) ** 2;

      if (distance < bestDistance && !placed.some(other => areasOverlap(candidate, other))) {
        best = candidate;
        bestDistance = distance;
      }
    }
  }

  return best;
}

/**
 * Changes a layout's grid, scaling every widget proportionally. Widgets that rounding would make
 * too small are grown back to their minimum size and moved to the nearest free position, or overlap
 * others if there is none.
 */
export function scaleLayout(layout: Layout, grid: Grid, minSizes: Readonly<Record<string, CellSize>> = {}): Layout {
  const areas: Record<string, Area> = {};
  const tooSmall: [id: string, wanted: Area][] = [];

  for (const [id, area] of Object.entries(layout.areas)) {
    const column = scaleAxis(area.column, area.columnSpan, layout.grid.columns, grid.columns);
    const row = scaleAxis(area.row, area.rowSpan, layout.grid.rows, grid.rows);
    const scaled = { column: column.start, row: row.start, columnSpan: column.span, rowSpan: row.span };
    // As with resizing, a widget already below its minimum isn't forced to grow.
    const min = minSizes[id] ?? SINGLE_CELL;
    const minColumns = Math.min(min.columns, area.columnSpan, grid.columns);
    const minRows = Math.min(min.rows, area.rowSpan, grid.rows);

    if (scaled.columnSpan >= minColumns && scaled.rowSpan >= minRows) {
      areas[id] = scaled;
    } else {
      tooSmall.push([
        id,
        {
          ...scaled,
          columnSpan: Math.max(scaled.columnSpan, minColumns),
          rowSpan: Math.max(scaled.rowSpan, minRows)
        }
      ]);
    }
  }

  // Largest first: big widgets have the fewest positions to choose from.
  tooSmall.sort(([, a], [, b]) => b.columnSpan * b.rowSpan - a.columnSpan * a.rowSpan);

  for (const [id, wanted] of tooSmall) {
    areas[id] = nearestFreeArea(wanted, grid, Object.values(areas)) ?? moveArea(wanted, { columns: 0, rows: 0 }, grid);
  }

  return { ...layout, grid, areas };
}

/** The layout with one widget's area replaced. */
export function withArea(layout: Layout, id: string, area: Area): Layout {
  return { ...layout, areas: { ...layout.areas, [id]: area } };
}

/** The page with one widget stacked above all others. Later widgets are on top. */
export function bringToFront(page: Page, id: string): Page {
  return {
    ...page,
    widgets: [...page.widgets.filter(widget => widget.id !== id), ...page.widgets.filter(widget => widget.id === id)]
  };
}

/** A point on the grid, in cells from its top left corner: `{ x: 0.5, y: 0.5 }` is the middle of the first cell. */
export type GridPoint = { x: number; y: number };

/** The cell a point is in. */
export function cellAt({ x, y }: GridPoint, grid: Grid): Area {
  return {
    column: clamp(Math.floor(x) + 1, 1, grid.columns),
    row: clamp(Math.floor(y) + 1, 1, grid.rows),
    columnSpan: 1,
    rowSpan: 1
  };
}

/** Where one axis may start so that it covers `from` to `to` and stays within `size` cells. */
function startRange(span: number, from: number, to: number, size: number) {
  return { first: Math.max(to - span + 1, 1), last: Math.min(from, size - span + 1) };
}

/**
 * The biggest free area that covers `around`, from `smallest` up to `wanted`. Of equally big ones,
 * the one with the lowest cost. Without any, the cheapest of the smallest size, overlapping others.
 */
function biggestArea(
  { grid, areas }: Layout,
  around: Area,
  smallest: CellSize,
  wanted: CellSize,
  costOf: (area: Area) => number
): Area {
  const placed = Object.values(areas);
  const min = {
    columns: Math.min(Math.max(smallest.columns, around.columnSpan), grid.columns),
    rows: Math.min(Math.max(smallest.rows, around.rowSpan), grid.rows)
  };

  function cheapest({ columns: columnSpan, rows: rowSpan }: CellSize, mayOverlap: boolean) {
    const columns = startRange(columnSpan, around.column, around.column + around.columnSpan - 1, grid.columns);
    const rows = startRange(rowSpan, around.row, around.row + around.rowSpan - 1, grid.rows);
    let best: { area: Area; cost: number } | undefined;

    for (let row = rows.first; row <= rows.last; row++) {
      for (let column = columns.first; column <= columns.last; column++) {
        const area = { column, row, columnSpan, rowSpan };
        const cost = costOf(area);

        if (cost < (best?.cost ?? Infinity) && (mayOverlap || !placed.some(other => areasOverlap(area, other)))) {
          best = { area, cost };
        }
      }
    }

    return best;
  }

  const sizes: CellSize[] = [];

  for (let columns = min.columns; columns <= Math.min(wanted.columns, grid.columns); columns++) {
    for (let rows = min.rows; rows <= Math.min(wanted.rows, grid.rows); rows++) {
      sizes.push({ columns, rows });
    }
  }

  // Biggest first, so the first one that fits somewhere ends the search.
  sizes.sort((a, b) => b.columns * b.rows - a.columns * a.rows);

  let best: { area: Area; cost: number } | undefined;

  for (const size of sizes) {
    if (best && size.columns * size.rows < best.area.columnSpan * best.area.rowSpan) {
      break;
    }

    const candidate = cheapest(size, false);

    if (candidate && candidate.cost < (best?.cost ?? Infinity)) {
      best = candidate;
    }
  }

  return best?.area ?? cheapest(min, true)?.area ?? around;
}

/**
 * Where a new widget goes: centred on `point` at its wanted size. Beside other widgets and the edges
 * of the grid it slides to keep that size, always covering the point, and only shrinks if nothing
 * bigger fits. If not even its cell is free, it overlaps others.
 */
export function placeArea(layout: Layout, point: GridPoint, wanted: CellSize): Area {
  return biggestArea(
    layout,
    cellAt(point, layout.grid),
    SINGLE_CELL,
    wanted,
    area => (area.column - 1 + area.columnSpan / 2 - point.x) ** 2 + (area.row - 1 + area.rowSpan / 2 - point.y) ** 2
  );
}

/**
 * Grows an area to its wanted size, or as much of that as is free: to the right and down, and only
 * for what doesn't fit there to the left and up. If not even `minSize` is free, it gets that size
 * anyway and overlaps others.
 */
export function growArea(layout: Layout, area: Area, wanted: CellSize, minSize: CellSize = SINGLE_CELL): Area {
  return biggestArea(layout, area, minSize, wanted, grown => area.column - grown.column + (area.row - grown.row));
}

/** An id no widget on the page has, e.g. `bar-2`. */
export function newWidgetId(page: Page, type: string): string {
  const ids = new Set(page.widgets.map(widget => widget.id));
  // Ids are limited to 64 characters, and so are types.
  const prefix = type.slice(0, 48);
  let number = 1;

  while (ids.has(`${prefix}-${number}`)) {
    number++;
  }

  return `${prefix}-${number}`;
}

/** The page with a widget added on top, at `area` in `layout` and the same share of any others. */
export function addWidget(page: Page, layout: Layout, widget: WidgetInstance, area: Area): Page {
  return {
    ...page,
    widgets: [...page.widgets, widget],
    layouts: page.layouts.map(other =>
      other === layout
        ? withArea(other, widget.id, area)
        : withArea(other, widget.id, shareOf(area, layout.grid, other.grid))
    )
  };
}

function shareOf(area: Area, from: Grid, to: Grid): Area {
  const column = scaleAxis(area.column, area.columnSpan, from.columns, to.columns);
  const row = scaleAxis(area.row, area.rowSpan, from.rows, to.rows);
  const scaled = {
    column: column.start,
    row: row.start,
    columnSpan: Math.max(column.span, 1),
    rowSpan: Math.max(row.span, 1)
  };

  // Rounding can leave a widget with no cells, just beyond the last one.
  return moveArea(scaled, { columns: 0, rows: 0 }, to);
}

/** The page without one of its widgets. */
export function removeWidget(page: Page, id: string): Page {
  return {
    ...page,
    widgets: page.widgets.filter(widget => widget.id !== id),
    layouts: page.layouts.map(layout => ({
      ...layout,
      areas: Object.fromEntries(Object.entries(layout.areas).filter(([other]) => other !== id))
    }))
  };
}

/** The page with a copy of a widget on top, at the same size in the nearest free spot (0023). */
export function duplicateWidget(page: Page, layout: Layout, id: string): { page: Page; id: string } {
  const widget = page.widgets.find(candidate => candidate.id === id);
  const area = layout.areas[id];

  if (!widget || !area) {
    return { page, id };
  }

  const copy = { ...structuredClone(widget), id: newWidgetId(page, widget.type) };

  return {
    page: addWidget(
      page,
      layout,
      copy,
      nearestFreeArea(area, layout.grid, Object.values(layout.areas)) ??
        moveArea(area, { columns: 1, rows: 1 }, layout.grid)
    ),
    id: copy.id
  };
}
