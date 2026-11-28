import type { Layout, Page, SharedSubgrid } from '@mfdiy/schema';

import { addWidget, bringToFront, withArea } from '@mfdiy/schema';
import { describe, expect, it } from 'vitest';

import { splitSubgridsFromPage, subgridIdOf, subgridWidgetId, withSubgridsOnPage } from './subgrids.js';

const layout: Layout = {
  orientation: 'any',
  grid: { columns: 24, rows: 15 },
  areas: { fuel: { column: 1, row: 1, columnSpan: 4, rowSpan: 4 } }
};

const page: Page = { id: 'flight', name: 'Flight', layouts: [layout], widgets: [{ id: 'fuel', type: 'bar' }] };

const strip: SharedSubgrid = {
  areas: {},
  grid: { columns: 12, rows: 2 },
  id: 'subgrid-1',
  place: { area: { column: 1, row: 14, columnSpan: 24, rowSpan: 2 }, grid: { columns: 24, rows: 15 } },
  widgets: []
};

const corner: SharedSubgrid = {
  ...strip,
  id: 'subgrid-2',
  place: { area: { column: 21, row: 1, columnSpan: 4, rowSpan: 2 }, grid: { columns: 24, rows: 15 } }
};

describe('shared subgrids on the page (0026)', () => {
  const combined = withSubgridsOnPage(page, layout, [strip, corner]);
  const [combinedLayout] = combined.page.layouts;

  it('stand on it as widgets above its own', () => {
    expect(combined.page.widgets.map(widget => widget.id)).toEqual([
      'fuel',
      subgridWidgetId('subgrid-1'),
      subgridWidgetId('subgrid-2')
    ]);
    expect(combined.layout.areas[subgridWidgetId('subgrid-1')]).toEqual(strip.place.area);
    expect(subgridIdOf(subgridWidgetId('subgrid-1'))).toBe('subgrid-1');
    expect(subgridIdOf('fuel')).toBeUndefined();
  });

  it('send a moved page widget to the page only', () => {
    const moved = {
      ...combined.page,
      layouts: [withArea(combined.layout, 'fuel', { column: 5, row: 5, columnSpan: 4, rowSpan: 4 })]
    };
    const split = splitSubgridsFromPage(bringToFront(moved, 'fuel'), page, layout, [strip, corner]);

    expect(split.subgrids).toBeNull();
    expect(split.page?.widgets.map(widget => widget.id)).toEqual(['fuel']);
    expect(split.page?.layouts[0]?.areas).toEqual({ fuel: { column: 5, row: 5, columnSpan: 4, rowSpan: 4 } });
  });

  it('send an added widget to the page', () => {
    const added = addWidget(
      combined.page,
      combined.layout,
      { id: 'bar-1', type: 'bar' },
      { column: 9, row: 1, columnSpan: 4, rowSpan: 4 }
    );
    const split = splitSubgridsFromPage(added, page, layout, [strip, corner]);

    expect(split.page?.widgets.map(widget => widget.id)).toEqual(['fuel', 'bar-1']);
    expect(Object.keys(split.page?.layouts[0]?.areas ?? {})).toEqual(['fuel', 'bar-1']);
  });

  it('send a moved subgrid to the subgrids, placed on this page, keeping its own grid and coming to the front', () => {
    const id = subgridWidgetId('subgrid-1');
    const moved = {
      ...combined.page,
      layouts: [withArea(combinedLayout ?? layout, id, { column: 1, row: 1, columnSpan: 24, rowSpan: 2 })]
    };
    const split = splitSubgridsFromPage(bringToFront(moved, id), page, layout, [strip, corner]);

    expect(split.page).toBeNull();
    expect(split.subgrids?.map(subgrid => subgrid.id)).toEqual(['subgrid-2', 'subgrid-1']);
    expect(split.subgrids?.[1]).toEqual({
      ...strip,
      place: { area: { column: 1, row: 1, columnSpan: 24, rowSpan: 2 }, grid: layout.grid }
    });
  });

  it('change nothing when nothing changed', () => {
    expect(splitSubgridsFromPage(combined.page, page, layout, [strip, corner])).toEqual({ page: null, subgrids: null });
  });
});
