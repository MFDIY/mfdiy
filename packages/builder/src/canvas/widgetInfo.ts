import type { CellSize, Grid, WidgetInstance } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';

/** A name for screen readers, e.g. "Light Gear". */
export function widgetName(widget: WidgetInstance): string {
  const type = widgetManifests[widget.type]?.label ?? widget.type;
  const label = widget.options?.['label'] || Object.values(widget.bindings ?? {})[0]?.signal || widget.action;

  return label ? `${type} ${label}` : type;
}

/** The manifest's minimum size, limited to what the grid has room for. */
export function widgetMinSize(widget: WidgetInstance, grid: Grid): CellSize {
  const { columns, rows } = widgetManifests[widget.type]?.minSize ?? { columns: 1, rows: 1 };

  return { columns: Math.min(columns, grid.columns), rows: Math.min(rows, grid.rows) };
}
