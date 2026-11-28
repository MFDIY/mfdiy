import type { Area, Grid, Layout, MfdDocument, Page, SharedSubgrid, SubgridPlace } from './document.js';

import { intersectAreas, type Overlap } from './layout.js';
import { moveArea, nearestFreeArea, type CopiedWidget } from './layoutEditing.js';

/* Shared subgrids (0026): geometry and edits, shared by the builder and the MFD. */

function coverAxis(start: number, span: number, placedOn: number, cells: number) {
  const first = Math.floor(((start - 1) * cells) / placedOn);
  const last = Math.ceil(((start - 1 + span) * cells) / placedOn);

  return { start: first + 1, span: Math.max(last - first, 1) };
}

/** The cells a shared subgrid covers on a page's grid: every one it touches, even partly (0026). */
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

/** Adds an empty shared subgrid on top, with one cell per page cell it covers (0026). */
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

/** A shared subgrid as it was copied, with its widgets (0006, 0026). */
export type CopiedSubgrid = {
  kind: 'subgrid';
  subgrid: SharedSubgrid;
};

/** What Copy takes: a widget, from a page or a shared subgrid, or a shared subgrid (0006). */
export type Copied = CopiedWidget | CopiedSubgrid;

/** A copy of a shared subgrid, to paste later; `undefined` if there's no such subgrid. */
export function copySubgrid(subgrids: readonly SharedSubgrid[], id: string): CopiedSubgrid | undefined {
  const subgrid = subgrids.find(candidate => candidate.id === id);

  return subgrid ? { kind: 'subgrid', subgrid: structuredClone(subgrid) } : undefined;
}

/**
 * The shared subgrids with a copied one pasted on top, exactly where it was (0006): on every page,
 * over the one it was copied from, if that's still there, as overlap.
 */
export function pasteSubgrid(
  subgrids: readonly SharedSubgrid[],
  copied: CopiedSubgrid
): { id: string; subgrids: SharedSubgrid[] } {
  const subgrid = { ...structuredClone(copied.subgrid), id: newSubgridId(subgrids) };

  return { id: subgrid.id, subgrids: [...subgrids, subgrid] };
}

/**
 * The shared subgrids with a copy of one on top, at the same size in the nearest spot that's free
 * on the page shown (0023), as a widget's Duplicate does. It keeps its own grid and widgets.
 */
export function duplicateSubgrid(
  subgrids: readonly SharedSubgrid[],
  id: string,
  layout: Layout
): { id: string; subgrids: SharedSubgrid[] } {
  const subgrid = subgrids.find(candidate => candidate.id === id);

  if (!subgrid) {
    return { id, subgrids: [...subgrids] };
  }

  const { grid } = layout;
  const area = subgridArea(subgrid.place, grid);
  const taken = [...Object.values(layout.areas), ...subgrids.map(other => subgridArea(other.place, grid))];
  const free = nearestFreeArea(area, grid, taken) ?? moveArea(area, { columns: 1, rows: 1 }, grid);

  return pasteSubgrid(subgrids, { kind: 'subgrid', subgrid: { ...subgrid, place: { area: free, grid } } });
}

/** The shared subgrids without one of them. */
export function removeSubgrid(subgrids: readonly SharedSubgrid[], id: string): SharedSubgrid[] {
  return subgrids.filter(subgrid => subgrid.id !== id);
}

/** The shared subgrids with one of them replaced. */
export function withSubgrid(subgrids: readonly SharedSubgrid[], subgrid: SharedSubgrid): SharedSubgrid[] {
  return subgrids.map(other => (other.id === subgrid.id ? subgrid : other));
}

/** A shared subgrid as a page, so page edits work on it; `pageToSubgrid` takes them back. */
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

/** Where shared subgrids overlap a page's widgets or each other (0026). */
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

/** The pages where shared subgrids overlap something (0026). */
export function pagesWithSubgridOverlap(document: MfdDocument): Set<string> {
  const subgrids = document.subgrids ?? [];

  return new Set(
    document.pages
      .filter(page => page.layouts.some(layout => findSubgridOverlaps(layout, subgrids).length > 0))
      .map(page => page.id)
  );
}
