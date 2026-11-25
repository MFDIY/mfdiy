import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { PageSchema, type Layout, type Page } from './document.js';
import { areasOverlap, findOverlaps, selectLayout, validateLayout } from './layout.js';

const layout: Layout = {
  orientation: 'any',
  grid: { columns: 4, rows: 3 },
  areas: {
    a: { column: 1, row: 1, columnSpan: 2, rowSpan: 1 },
    b: { column: 3, row: 1, columnSpan: 2, rowSpan: 2 }
  }
};

const widgets = [
  { id: 'a', type: 'light' },
  { id: 'b', type: 'bar' }
];

describe('areasOverlap', () => {
  it('treats touching edges as not overlapping', () => {
    expect(areasOverlap(layout.areas['a']!, layout.areas['b']!)).toBe(false);
  });

  it('detects overlap', () => {
    expect(areasOverlap({ column: 2, row: 1, columnSpan: 2, rowSpan: 1 }, layout.areas['b']!)).toBe(true);
  });
});

describe('findOverlaps', () => {
  it('finds nothing when widgets only touch', () => {
    expect(findOverlaps(layout)).toEqual([]);
  });

  it('reports the shared cells of each overlapping pair', () => {
    const a = { column: 2, row: 1, columnSpan: 3, rowSpan: 1 };

    expect(findOverlaps({ ...layout, areas: { ...layout.areas, a } })).toEqual([
      { widgetIds: ['a', 'b'], area: { column: 3, row: 1, columnSpan: 2, rowSpan: 1 } }
    ]);
  });

  it('reports a widget completely hidden by another', () => {
    const hidden = { column: 4, row: 2, columnSpan: 1, rowSpan: 1 };

    expect(findOverlaps({ ...layout, areas: { ...layout.areas, hidden } })).toEqual([
      { widgetIds: ['b', 'hidden'], area: hidden }
    ]);
  });
});

describe('validateLayout', () => {
  it('accepts a valid layout', () => {
    expect(validateLayout(layout, widgets)).toEqual([]);
  });

  it('reports missing areas and unknown widgets', () => {
    const problems = validateLayout(
      { ...layout, areas: { a: layout.areas['a']!, c: { column: 1, row: 1, columnSpan: 1, rowSpan: 1 } } },
      widgets
    );

    expect(problems).toEqual(
      expect.arrayContaining([
        { kind: 'missing-area', widgetId: 'b' },
        { kind: 'unknown-widget', widgetId: 'c' }
      ])
    );
  });
});

describe('PageSchema', () => {
  const page: Page = { id: 'p', name: 'Page', widgets, layouts: [layout] };

  it('accepts a valid page', () => {
    expect(v.safeParse(PageSchema, page).success).toBe(true);
  });

  it('accepts overlapping widgets', () => {
    const overlapping = { ...layout, areas: { ...layout.areas, a: { column: 2, row: 1, columnSpan: 2, rowSpan: 1 } } };

    expect(v.safeParse(PageSchema, { ...page, layouts: [overlapping] }).success).toBe(true);
  });

  it('rejects widgets outside the grid', () => {
    const outside = { ...layout, areas: { ...layout.areas, a: { column: 4, row: 3, columnSpan: 2, rowSpan: 1 } } };

    expect(v.safeParse(PageSchema, { ...page, layouts: [outside] }).success).toBe(false);
  });

  it('rejects two layouts with the same orientation', () => {
    expect(v.safeParse(PageSchema, { ...page, layouts: [layout, layout] }).success).toBe(false);
  });
});

describe('selectLayout', () => {
  const portrait: Layout = { ...layout, orientation: 'portrait' };
  const page: Page = { id: 'p', name: 'Page', widgets, layouts: [layout, portrait] };

  it('prefers an exact orientation match', () => {
    expect(selectLayout(page, 'portrait')).toBe(portrait);
  });

  it('falls back to the any-orientation layout', () => {
    expect(selectLayout(page, 'landscape')).toBe(layout);
  });
});
