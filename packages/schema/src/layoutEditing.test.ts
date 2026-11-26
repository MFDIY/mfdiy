import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { PageSchema, type Area, type Layout, type Page } from './document.js';
import { findOverlaps, intersectAreas, validateLayout } from './layout.js';
import {
  addWidget,
  bringToFront,
  cellAt,
  duplicateWidget,
  growArea,
  moveArea,
  newWidgetId,
  placeArea,
  removeWidget,
  resizeArea,
  scaleLayout,
  withArea
} from './layoutEditing.js';

function area(column: number, row: number, columnSpan = 1, rowSpan = 1): Area {
  return { column, row, columnSpan, rowSpan };
}

const grid = { columns: 6, rows: 4 };

function layoutOf(areas: Record<string, Area>, size = grid): Layout {
  return { orientation: 'any', grid: size, areas };
}

function problems(layout: Layout) {
  return validateLayout(
    layout,
    Object.keys(layout.areas).map(id => ({ id }))
  );
}

describe('moveArea', () => {
  it('moves by whole cells', () => {
    expect(moveArea(area(2, 2, 2, 1), { columns: 1, rows: -1 }, grid)).toEqual(area(3, 1, 2, 1));
  });

  it('stops at the edges of the grid, keeping its size', () => {
    expect(moveArea(area(2, 2, 2, 2), { columns: 99, rows: 99 }, grid)).toEqual(area(5, 3, 2, 2));
    expect(moveArea(area(2, 2, 2, 2), { columns: -99, rows: -99 }, grid)).toEqual(area(1, 1, 2, 2));
  });
});

describe('resizeArea', () => {
  it('keeps the opposite corner in place', () => {
    expect(resizeArea(area(3, 2, 2, 2), { column: -1, row: -1 }, { columns: -1, rows: -1 }, grid)).toEqual(
      area(2, 1, 3, 3)
    );
    expect(resizeArea(area(3, 2, 2, 2), { column: 1, row: 1 }, { columns: 1, rows: 1 }, grid)).toEqual(
      area(3, 2, 3, 3)
    );
  });

  it('leaves the other axis alone when dragging an edge', () => {
    expect(resizeArea(area(3, 2, 2, 2), { column: 1, row: 0 }, { columns: 1, rows: 5 }, grid)).toEqual(
      area(3, 2, 3, 2)
    );
  });

  it('stops at the edges of the grid', () => {
    expect(resizeArea(area(3, 2, 2, 2), { column: 1, row: -1 }, { columns: 99, rows: -99 }, grid)).toEqual(
      area(3, 1, 4, 3)
    );
  });

  it('stops at the minimum size from either side', () => {
    const min = { columns: 2, rows: 1 };

    expect(resizeArea(area(2, 1, 4, 3), { column: 1, row: 1 }, { columns: -99, rows: -99 }, grid, min)).toEqual(
      area(2, 1, 2, 1)
    );
    expect(resizeArea(area(2, 1, 4, 3), { column: -1, row: -1 }, { columns: 99, rows: 99 }, grid, min)).toEqual(
      area(4, 3, 2, 1)
    );
  });

  it('does not force a widget below its minimum to grow', () => {
    const min = { columns: 3, rows: 3 };

    expect(resizeArea(area(2, 2), { column: 1, row: 1 }, { columns: -1, rows: 0 }, grid, min)).toEqual(area(2, 2));
  });
});

describe('scaleLayout', () => {
  const layout = layoutOf({ a: area(1, 1, 3, 2), b: area(4, 1, 3, 2), c: area(1, 3, 6, 2) });

  it('scales exactly when the grid is a multiple, and back again', () => {
    const scaled = scaleLayout(layout, { columns: 12, rows: 8 });

    expect(scaled.areas).toEqual({ a: area(1, 1, 6, 4), b: area(7, 1, 6, 4), c: area(1, 5, 12, 4) });
    expect(scaleLayout(scaled, grid)).toEqual(layout);
  });

  it('never overlaps widgets or leaves the grid, whatever the rounding', () => {
    for (let columns = 2; columns <= 16; columns++) {
      for (let rows = 2; rows <= 16; rows++) {
        const scaled = scaleLayout(layout, { columns, rows });

        expect([...problems(scaled), ...findOverlaps(scaled)], `${columns} × ${rows}`).toEqual([]);
      }
    }
  });

  it('moves widgets that rounding would remove to the nearest free cell', () => {
    const row = layoutOf({ a: area(1, 1), b: area(2, 1), c: area(3, 1), d: area(4, 1) }, { columns: 4, rows: 2 });
    const scaled = scaleLayout(row, { columns: 2, rows: 2 });

    expect(Object.keys(scaled.areas).sort()).toEqual(['a', 'b', 'c', 'd']);
    expect([...problems(scaled), ...findOverlaps(scaled)]).toEqual([]);
  });

  it('overlaps widgets that cannot all fit, inside the grid', () => {
    const full = layoutOf({ a: area(1, 1), b: area(2, 1) }, { columns: 2, rows: 1 });

    expect(scaleLayout(full, { columns: 1, rows: 1 }).areas).toEqual({ a: area(1, 1), b: area(1, 1) });
  });

  it('respects minimum sizes', () => {
    const scaled = scaleLayout(
      layoutOf({ a: area(1, 1, 4, 2) }),
      { columns: 3, rows: 2 },
      { a: { columns: 3, rows: 1 } }
    );

    expect(scaled.areas).toEqual({ a: area(1, 1, 3, 1) });
  });
});

describe('withArea', () => {
  it('replaces one area without changing the original', () => {
    const layout = layoutOf({ a: area(1, 1), b: area(2, 1) });

    expect(withArea(layout, 'a', area(1, 2)).areas).toEqual({ a: area(1, 2), b: area(2, 1) });
    expect(layout.areas['a']).toEqual(area(1, 1));
  });
});

describe('bringToFront', () => {
  const page: Page = {
    id: 'p',
    name: 'Page',
    widgets: ['a', 'b', 'c'].map(id => ({ id, type: 'light' })),
    layouts: [layoutOf({ a: area(1, 1), b: area(2, 1), c: area(3, 1) })]
  };

  it('moves the widget last and keeps the others in order', () => {
    expect(bringToFront(page, 'a').widgets.map(widget => widget.id)).toEqual(['b', 'c', 'a']);
    expect(bringToFront(page, 'c').widgets.map(widget => widget.id)).toEqual(['a', 'b', 'c']);
  });

  it('changes nothing for an unknown widget', () => {
    expect(bringToFront(page, 'x')).toEqual(page);
  });
});

describe('placeArea', () => {
  const wanted = { columns: 3, rows: 2 };

  it('is centred on the point', () => {
    expect(placeArea(layoutOf({}), { x: 2.5, y: 2 }, wanted)).toEqual(area(2, 2, 3, 2));
    expect(placeArea(layoutOf({}), { x: 3.4, y: 2.6 }, wanted)).toEqual(area(3, 3, 3, 2));
  });

  it('slides along the edges of the grid, keeping its size', () => {
    expect(placeArea(layoutOf({}), { x: 0.1, y: 0.1 }, wanted)).toEqual(area(1, 1, 3, 2));
    expect(placeArea(layoutOf({}), { x: 6, y: 4 }, wanted)).toEqual(area(4, 3, 3, 2));
  });

  it('slides along other widgets, keeping its size', () => {
    expect(placeArea(layoutOf({ a: area(1, 1, 2, 4) }), { x: 2.1, y: 2 }, wanted)).toEqual(area(3, 2, 3, 2));
  });

  it('shrinks only if nothing bigger fits', () => {
    const tall = layoutOf({ a: area(2, 1, 1, 4) });
    const wide = layoutOf({ a: area(1, 2, 6, 1) });

    expect(placeArea(tall, { x: 0.5, y: 1.9 }, wanted)).toEqual(area(1, 2, 1, 2));
    expect(placeArea(wide, { x: 2.5, y: 0.5 }, wanted)).toEqual(area(2, 1, 3, 1));
  });

  it('covers the point, and never overlaps while there is room', () => {
    const layout = layoutOf({ a: area(1, 1, 2, 2), b: area(4, 2, 2, 2), c: area(1, 4, 6, 1) });

    for (let y = 0.25; y < grid.rows; y += 0.5) {
      for (let x = 0.25; x < grid.columns; x += 0.5) {
        const cell = cellAt({ x, y }, grid);

        if (findOverlaps(withArea(layout, 'cell', cell)).length > 0) {
          continue;
        }

        const small = placeArea(layout, { x, y }, { columns: 2, rows: 2 });
        const large = growArea(layout, small, { columns: 4, rows: 2 });

        expect(intersectAreas(small, cell)).toEqual(cell);
        expect(intersectAreas(large, small)).toEqual(small);

        for (const placed of [small, large]) {
          expect(findOverlaps(withArea(layout, 'new', placed))).toEqual([]);
          expect(problems(withArea(layout, 'new', placed))).toEqual([]);
        }
      }
    }
  });

  it('finds the best place on a fine, crowded grid', () => {
    const size = { columns: 48, rows: 48 };
    const crowded: Record<string, Area> = {};

    // Every other cell, so nothing bigger than one column fits.
    for (let column = 1; column <= 48; column += 2) {
      for (let row = 1; row <= 48; row += 4) {
        crowded[`${column}-${row}`] = area(column, row, 1, 4);
      }
    }

    expect(placeArea(layoutOf(crowded, size), { x: 25.5, y: 24 }, { columns: 16, rows: 12 })).toEqual(
      area(26, 19, 1, 12)
    );
  });
});

describe('growArea', () => {
  const wanted = { columns: 4, rows: 2 };

  it('grows to the right', () => {
    expect(growArea(layoutOf({}), area(2, 2, 2, 2), wanted)).toEqual(area(2, 2, 4, 2));
  });

  it('grows to the left only for what does not fit on the right', () => {
    expect(growArea(layoutOf({}), area(4, 2, 2, 2), wanted)).toEqual(area(3, 2, 4, 2));
    expect(growArea(layoutOf({}), area(5, 2, 2, 2), wanted)).toEqual(area(3, 2, 4, 2));
    expect(growArea(layoutOf({ a: area(5, 1, 1, 4) }), area(2, 2, 2, 2), wanted)).toEqual(area(1, 2, 4, 2));
  });

  it('grows down, and up only for what does not fit below', () => {
    const tall = { columns: 1, rows: 3 };

    expect(growArea(layoutOf({}), area(1, 1), tall)).toEqual(area(1, 1, 1, 3));
    expect(growArea(layoutOf({}), area(1, 3), tall)).toEqual(area(1, 2, 1, 3));
  });

  it('takes what is free on both sides if that is less than it wants', () => {
    const layout = layoutOf({ a: area(1, 1, 1, 4), b: area(5, 1, 1, 4) });

    expect(growArea(layout, area(3, 2, 1, 2), wanted)).toEqual(area(2, 2, 3, 2));
  });

  it('stays as it is if it is big enough or has no room', () => {
    expect(growArea(layoutOf({}), area(2, 2, 4, 2), wanted)).toEqual(area(2, 2, 4, 2));
    expect(growArea(layoutOf({ a: area(2, 1, 1, 4) }), area(1, 2), { columns: 4, rows: 1 })).toEqual(area(1, 2));
  });

  it('overlaps at its minimum size if there is no room, within the grid', () => {
    const minSize = { columns: 2, rows: 2 };

    expect(growArea(layoutOf({ a: area(2, 1, 1, 4) }), area(1, 2), wanted, minSize)).toEqual(area(1, 2, 2, 2));
    expect(growArea(layoutOf({ a: area(5, 1, 1, 4) }), area(6, 4), wanted, minSize)).toEqual(area(5, 3, 2, 2));
    expect(growArea(layoutOf({}, { columns: 1, rows: 1 }), area(1, 1), wanted, minSize)).toEqual(area(1, 1));
  });
});

describe('adding and removing widgets', () => {
  const page: Page = {
    id: 'page',
    name: 'Page',
    widgets: [{ id: 'bar-1', type: 'bar' }],
    layouts: [
      layoutOf({ 'bar-1': area(1, 1) }),
      { ...layoutOf({ 'bar-1': area(1, 1) }, { columns: 2, rows: 8 }), orientation: 'portrait' }
    ]
  };

  const layout = page.layouts[0] as Layout;

  it('finds an unused id', () => {
    expect(newWidgetId(page, 'bar')).toBe('bar-2');
    expect(newWidgetId(page, 'light')).toBe('light-1');
    expect(newWidgetId(page, 'x'.repeat(64)).length).toBeLessThanOrEqual(64);
  });

  it.each([area(3, 1, 2, 2), area(6, 4), area(1, 1)])('adds to every layout: %o', added => {
    const next = addWidget(page, layout, { id: 'light-1', type: 'light' }, added);

    expect(next.widgets.at(-1)?.id).toBe('light-1');
    expect(next.layouts[0]?.areas['light-1']).toEqual(added);
    expect(v.safeParse(PageSchema, next).issues).toBeUndefined();
  });

  it('duplicates next to the original, with a copy of its settings', () => {
    const configured: Page = {
      ...page,
      widgets: [
        { id: 'bar-1', type: 'bar', bindings: { value: { signal: 'fuel', thresholds: { low: { warning: 25 } } } } }
      ]
    };
    const next = duplicateWidget(configured, layout, 'bar-1');

    expect(next.id).toBe('bar-2');
    expect(next.page.widgets[1]).toEqual({ ...configured.widgets[0], id: 'bar-2' });
    expect(next.page.widgets[1]?.bindings).not.toBe(configured.widgets[0]?.bindings);
    expect(next.page.layouts[0]?.areas['bar-2']).toEqual(area(2, 1));
    expect(v.safeParse(PageSchema, next.page).issues).toBeUndefined();
  });

  it('duplicates on top, offset by a cell, when there is no room', () => {
    const full: Layout = layoutOf({ 'bar-1': area(1, 1, 6, 4) });
    const next = duplicateWidget({ ...page, layouts: [full] }, full, 'bar-1');

    expect(next.page.layouts[0]?.areas['bar-2']).toEqual(area(1, 1, 6, 4));
  });

  it('removes from every layout', () => {
    const next = removeWidget(page, 'bar-1');

    expect(next.widgets).toEqual([]);
    expect(v.safeParse(PageSchema, next).issues).toBeUndefined();
  });
});
