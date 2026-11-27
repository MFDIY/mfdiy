import type { CellSize, Grid, WidgetInstance } from '@mfdiy/schema';

import { widgetManifests, type WidgetManifest } from '@mfdiy/instruments';
import { gameActionOf, pageActionOf } from '@mfdiy/schema';

/** A name for screen readers, e.g. "Light Gear". */
export function widgetName(widget: WidgetInstance): string {
  const type = widgetManifests[widget.type]?.label ?? widget.type;
  const label =
    widget.options?.['label'] ||
    Object.values(widget.bindings ?? {})[0]?.signal ||
    gameActionOf(widget) ||
    pageActionOf(widget);

  return label ? `${type} ${label}` : type;
}

/** The manifest's minimum size, limited to what the grid has room for. */
export function widgetMinSize(widget: WidgetInstance, grid: Grid): CellSize {
  const { columns, rows } = widgetManifests[widget.type]?.minSize ?? { columns: 1, rows: 1 };

  return { columns: Math.min(columns, grid.columns), rows: Math.min(rows, grid.rows) };
}

/** The manifest's default size in cells, never below its minimum. */
export function widgetDefaultSize({ defaultSize, minSize }: WidgetManifest, grid: Grid): CellSize {
  return {
    columns: Math.min(Math.max(Math.round(defaultSize.width * grid.columns), minSize.columns), grid.columns),
    rows: Math.min(Math.max(Math.round(defaultSize.height * grid.rows), minSize.rows), grid.rows)
  };
}
