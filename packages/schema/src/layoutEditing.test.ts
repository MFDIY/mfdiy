import type { Area, Layout } from './document.js';

import { describe, expect, it } from 'vitest';

import { findOverlaps, validateLayout } from './layout.js';
import { moveArea, resizeArea, scaleLayout, withArea } from './layoutEditing.js';

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
