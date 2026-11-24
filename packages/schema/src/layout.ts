import type { Area, Grid, Layout, Page } from './document.js';

/*
 * Pure layout geometry shared by the builder (snapping, collision previews) and the schema
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

/** True if `area` fits in the layout without overlapping any widget other than `ignoreId`. */
export function canPlace(layout: Layout, area: Area, ignoreId?: string): boolean {
  return (
    isWithinGrid(area, layout.grid) &&
    Object.entries(layout.areas).every(([id, other]) => id === ignoreId || !areasOverlap(area, other))
  );
}

export type LayoutProblem =
  | { kind: 'missing-area'; widgetId: string }
  | { kind: 'unknown-widget'; widgetId: string }
  | { kind: 'out-of-grid'; widgetId: string }
  | { kind: 'overlap'; widgetId: string; otherId: string };

/** Every widget has exactly one area, inside the grid, overlapping no other widget. */
export function validateLayout(layout: Layout, widgets: readonly { id: string }[]): LayoutProblem[] {
  const problems: LayoutProblem[] = [];
  const widgetIds = new Set(widgets.map(widget => widget.id));

  for (const id of widgetIds) {
    if (!layout.areas[id]) {
      problems.push({ kind: 'missing-area', widgetId: id });
    }
  }

  const placed = Object.entries(layout.areas);

  placed.forEach(([id, area], index) => {
    if (!widgetIds.has(id)) {
      problems.push({ kind: 'unknown-widget', widgetId: id });
    }

    if (!isWithinGrid(area, layout.grid)) {
      problems.push({ kind: 'out-of-grid', widgetId: id });
    }

    for (const [otherId, other] of placed.slice(index + 1)) {
      if (areasOverlap(area, other)) {
        problems.push({ kind: 'overlap', widgetId: id, otherId });
      }
    }
  });

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
