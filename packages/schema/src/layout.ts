import type { Area, Grid, Layout, Page } from './document.js';

/*
 * Pure layout geometry shared by the builder (snapping, overlap highlights) and the schema
 * (validating documents from elsewhere). See docs/decisions/0006.
 */

export function areasOverlap(a: Area, b: Area): boolean {
  return (
    a.column < b.column + b.columnSpan &&
    b.column < a.column + a.columnSpan &&
    a.row < b.row + b.rowSpan &&
    b.row < a.row + a.rowSpan
  );
}

export function isWithinGrid(area: Area, grid: Grid): boolean {
  return (
    area.column >= 1 &&
    area.row >= 1 &&
    area.columnSpan >= 1 &&
    area.rowSpan >= 1 &&
    area.column + area.columnSpan - 1 <= grid.columns &&
    area.row + area.rowSpan - 1 <= grid.rows
  );
}

/** The cells two areas share, if any. */
export function intersectAreas(a: Area, b: Area): Area | undefined {
  if (!areasOverlap(a, b)) {
    return undefined;
  }

  const column = Math.max(a.column, b.column);
  const row = Math.max(a.row, b.row);

  return {
    column,
    row,
    columnSpan: Math.min(a.column + a.columnSpan, b.column + b.columnSpan) - column,
    rowSpan: Math.min(a.row + a.rowSpan, b.row + b.rowSpan) - row
  };
}

export type Overlap = { widgetIds: [string, string]; area: Area };

/** Every pair of widgets that overlap, and where. Allowed, but the builder points them out. */
export function findOverlaps(layout: Layout): Overlap[] {
  const placed = Object.entries(layout.areas);

  return placed.flatMap(([id, area], index) =>
    placed.slice(index + 1).flatMap(([otherId, other]) => {
      const shared = intersectAreas(area, other);

      return shared ? [{ widgetIds: [id, otherId] satisfies [string, string], area: shared }] : [];
    })
  );
}

export type LayoutProblem =
  | { kind: 'missing-area'; widgetId: string }
  | { kind: 'unknown-widget'; widgetId: string }
  | { kind: 'out-of-grid'; widgetId: string };

/** Every widget has exactly one area, inside the grid. */
export function validateLayout(layout: Layout, widgets: readonly { id: string }[]): LayoutProblem[] {
  const problems: LayoutProblem[] = [];
  const widgetIds = new Set(widgets.map(widget => widget.id));

  for (const id of widgetIds) {
    if (!layout.areas[id]) {
      problems.push({ kind: 'missing-area', widgetId: id });
    }
  }

  for (const [id, area] of Object.entries(layout.areas)) {
    if (!widgetIds.has(id)) {
      problems.push({ kind: 'unknown-widget', widgetId: id });
    }

    if (!isWithinGrid(area, layout.grid)) {
      problems.push({ kind: 'out-of-grid', widgetId: id });
    }
  }

  return problems;
}

/**
 * The layout to show on a screen: an exact orientation match first, then an `any` layout, then the
 * page's first layout (stretched).
 */
export function selectLayout(page: Page, orientation: 'landscape' | 'portrait'): Layout {
  return (
    page.layouts.find(layout => layout.orientation === orientation) ??
    page.layouts.find(layout => layout.orientation === 'any') ??
    // The schema guarantees at least one layout.
    (page.layouts[0] as Layout)
  );
}
