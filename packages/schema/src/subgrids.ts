import type { Area, Grid, Layout, MfdDocument, Page, SharedSubgrid, SubgridPlace } from './document.js';

import { intersectAreas, type Overlap } from './layout.js';

/*
 * Shared subgrids (0026): placed once, shown on every page in the same place. Pure geometry and
 * edits, shared by the builder and the MFD.
 */

/** The cells a subgrid covers along one axis of a page with `cells` cells: every one it touches, even partly. */
function coverAxis(start: number, span: number, placedOn: number, cells: number) {
  const first = Math.floor(((start - 1) * cells) / placedOn);
  const last = Math.ceil(((start - 1 + span) * cells) / placedOn);

  return { start: first + 1, span: Math.max(last - first, 1) };
}

/**
 * The cells a shared subgrid covers on a page's grid. On the page it was placed on, exactly those
 * cells; on a page with another grid, the same share of the shape, widened to every cell it touches
 * (0026).
 */
export function subgridArea({ area, grid: placedOn }: SubgridPlace, grid: Grid): Area {
  const column = coverAxis(area.column, area.columnSpan, placedOn.columns, grid.columns);
  const row = coverAxis(area.row, area.rowSpan, placedOn.rows, grid.rows);

  return { column: column.start, row: row.start, columnSpan: column.span, rowSpan: row.span };
}

/** An id no shared subgrid has, e.g. `subgrid-2`. */
export function newSubgridId(subgrids: readonly SharedSubgrid[]): string {
  const ids = new Set(subgrids.map(subgrid => subgrid.id));
  let number = 1;

  while (ids.has(`subgrid-${number}`)) {
    number++;
  }

  return `subgrid-${number}`;
}

/**
 * The profile's shared subgrids with an empty one on top, at `area` on a page's `grid`. Its own
 * grid starts with one cell per page cell it covers, so it lines up with that page (0026).
 */
export function addSubgrid(
  subgrids: readonly SharedSubgrid[],
  area: Area,
  grid: Grid
): { id: string; subgrids: SharedSubgrid[] } {
  const subgrid: SharedSubgrid = {
    areas: {},
    grid: { columns: area.columnSpan, rows: area.rowSpan },
    id: newSubgridId(subgrids),
    place: { area, grid },
    widgets: []
  };

  return { id: subgrid.id, subgrids: [...subgrids, subgrid] };
}

/** The shared subgrids without one of them. */
export function removeSubgrid(subgrids: readonly SharedSubgrid[], id: string): SharedSubgrid[] {
  return subgrids.filter(subgrid => subgrid.id !== id);
}

/** The shared subgrids with one of them replaced. */
export function withSubgrid(subgrids: readonly SharedSubgrid[], subgrid: SharedSubgrid): SharedSubgrid[] {
  return subgrids.map(other => (other.id === subgrid.id ? subgrid : other));
}

/**
 * A shared subgrid as a page, so everything that edits a page's widgets edits its widgets too
 * (0026: "widgets inside it work as they do on a page"). `pageToSubgrid` takes the edits back.
 */
export function subgridAsPage(subgrid: SharedSubgrid): Page {
  return {
    id: subgrid.id,
    layouts: [{ areas: subgrid.areas, grid: subgrid.grid, orientation: 'any' }],
    name: 'Shared subgrid',
    widgets: subgrid.widgets
  };
}

/** The subgrid with the widgets and grid of a page made by `subgridAsPage`. */
export function pageToSubgrid(subgrid: SharedSubgrid, page: Page): SharedSubgrid {
  const [layout] = page.layouts;

  return layout ? { ...subgrid, areas: layout.areas, grid: layout.grid, widgets: page.widgets } : subgrid;
}

/**
 * Where shared subgrids overlap on a page (0026): the page's widgets under them, and each other.
 * Overlap between the page's own widgets isn't included; `findOverlaps` finds that.
 */
export function findSubgridOverlaps(layout: Layout, subgrids: readonly SharedSubgrid[]): Overlap[] {
  const covered = subgrids.map(subgrid => [subgrid.id, subgridArea(subgrid.place, layout.grid)] as const);

  return covered.flatMap(([id, area], index) => [
    ...Object.entries(layout.areas).flatMap(([widgetId, widgetArea]) => {
      const shared = intersectAreas(area, widgetArea);

      return shared ? [{ area: shared, widgetIds: [widgetId, id] satisfies [string, string] }] : [];
    }),
    ...covered.slice(index + 1).flatMap(([otherId, other]) => {
      const shared = intersectAreas(area, other);

      return shared ? [{ area: shared, widgetIds: [id, otherId] satisfies [string, string] }] : [];
    })
  ]);
}

/** The pages where shared subgrids overlap the page's widgets or each other, for the page tabs to mark (0026). */
export function pagesWithSubgridOverlap(document: MfdDocument): Set<string> {
  const subgrids = document.subgrids ?? [];

  return new Set(
    document.pages
      .filter(page => page.layouts.some(layout => findSubgridOverlaps(layout, subgrids).length > 0))
      .map(page => page.id)
  );
}
