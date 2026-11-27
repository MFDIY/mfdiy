import type { Layout, MfdDocument, SharedSubgrid } from './document.js';

import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { createBlankDocument } from './blankDocument.js';
import { MfdDocumentSchema } from './document.js';
import {
  addSubgrid,
  findSubgridOverlaps,
  pagesWithSubgridOverlap,
  pageToSubgrid,
  removeSubgrid,
  subgridArea,
  subgridAsPage
} from './subgrids.js';

const strip: SharedSubgrid = {
  areas: {},
  grid: { columns: 24, rows: 2 },
  id: 'subgrid-1',
  place: { area: { column: 1, row: 14, columnSpan: 24, rowSpan: 2 }, grid: { columns: 24, rows: 15 } },
  widgets: []
};

describe('subgridArea (0026)', () => {
  it('covers exactly the cells it was placed on, on the page it was placed on', () => {
    expect(subgridArea(strip.place, { columns: 24, rows: 15 })).toEqual(strip.place.area);
  });

  it('covers every cell it touches, even partly, on a page with another grid', () => {
    // Rows 14–15 of 15 are the bottom 2/15 of the page: rows 4.27–5 of 5, so all of row 5.
    expect(subgridArea(strip.place, { columns: 4, rows: 5 })).toEqual({
      column: 1,
      row: 5,
      columnSpan: 4,
      rowSpan: 1
    });
    // Columns 2–3 of 4 are the middle half: 1.75–5.25 of 7 columns, so it touches columns 2–6.
    expect(
      subgridArea(
        { area: { column: 2, row: 1, columnSpan: 2, rowSpan: 1 }, grid: { columns: 4, rows: 1 } },
        { columns: 7, rows: 1 }
      )
    ).toEqual({ column: 2, row: 1, columnSpan: 5, rowSpan: 1 });
  });

  it('never reaches beyond the grid', () => {
    const area = subgridArea(strip.place, { columns: 7, rows: 3 });

    expect(area.column + area.columnSpan - 1).toBeLessThanOrEqual(7);
    expect(area.row + area.rowSpan - 1).toBeLessThanOrEqual(3);
  });
});

describe('adding and removing', () => {
  it('starts empty, with one cell per page cell it covers', () => {
    const document = createBlankDocument('Test', 'demo');
    const added = addSubgrid([], { column: 3, row: 2, columnSpan: 5, rowSpan: 3 }, { columns: 24, rows: 15 });
    const [subgrid] = added.subgrids;

    expect(added.id).toBe('subgrid-1');
    expect(subgrid?.grid).toEqual({ columns: 5, rows: 3 });
    expect(subgrid?.widgets).toEqual([]);
    expect(v.safeParse(MfdDocumentSchema, { ...document, subgrids: added.subgrids }).success).toBe(true);
  });

  it('gives each a new id, and stacks later ones on top', () => {
    const first = addSubgrid([], strip.place.area, strip.place.grid);
    const second = addSubgrid(first.subgrids, strip.place.area, strip.place.grid);

    expect(second.subgrids.map(subgrid => subgrid.id)).toEqual(['subgrid-1', 'subgrid-2']);
    expect(removeSubgrid(second.subgrids, 'subgrid-1').map(subgrid => subgrid.id)).toEqual(['subgrid-2']);
  });
});

describe('editing as a page', () => {
  it('round-trips its widgets and grid', () => {
    const page = subgridAsPage(strip);
    const edited = {
      ...page,
      widgets: [{ id: 'button-1', type: 'button' }],
      layouts: [
        {
          orientation: 'any' as const,
          grid: { columns: 6, rows: 1 },
          areas: { 'button-1': { column: 1, row: 1, columnSpan: 1, rowSpan: 1 } }
        }
      ]
    };

    expect(pageToSubgrid(strip, edited)).toEqual({
      ...strip,
      areas: { 'button-1': { column: 1, row: 1, columnSpan: 1, rowSpan: 1 } },
      grid: { columns: 6, rows: 1 },
      widgets: [{ id: 'button-1', type: 'button' }]
    });
  });
});

describe('overlap (0026)', () => {
  const layout: Layout = {
    orientation: 'any',
    grid: { columns: 24, rows: 15 },
    areas: {
      above: { column: 1, row: 1, columnSpan: 4, rowSpan: 4 },
      under: { column: 1, row: 12, columnSpan: 4, rowSpan: 4 }
    }
  };

  it('finds page widgets under a subgrid, and subgrids over each other', () => {
    const other: SharedSubgrid = {
      ...strip,
      id: 'subgrid-2',
      place: { ...strip.place, area: { column: 20, row: 13, columnSpan: 5, rowSpan: 3 } }
    };

    expect(findSubgridOverlaps(layout, [strip, other])).toEqual([
      { area: { column: 1, row: 14, columnSpan: 4, rowSpan: 2 }, widgetIds: ['under', 'subgrid-1'] },
      { area: { column: 20, row: 14, columnSpan: 5, rowSpan: 2 }, widgetIds: ['subgrid-1', 'subgrid-2'] }
    ]);
  });

  it('marks the pages that have it', () => {
    const blank = createBlankDocument('Test', 'demo');
    const [page] = blank.pages;
    const document: MfdDocument = {
      ...blank,
      pages: page
        ? [
            { ...page, id: 'clear' },
            {
              ...page,
              id: 'crowded',
              widgets: [{ id: 'under', type: 'bar' }],
              layouts: [{ ...layout, areas: { under: layout.areas['under'] ?? strip.place.area } }]
            }
          ]
        : [],
      subgrids: [strip]
    };

    expect([...pagesWithSubgridOverlap(document)]).toEqual(['crowded']);
  });
});
