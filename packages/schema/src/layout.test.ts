import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { PageSchema, type Layout, type Page } from './document.js';
import { areasOverlap, canPlace, selectLayout, validateLayout } from './layout.js';

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

describe('canPlace', () => {
  it('rejects areas outside the grid', () => {
    expect(canPlace(layout, { column: 4, row: 3, columnSpan: 2, rowSpan: 1 })).toBe(false);
  });

  it('ignores the widget being moved', () => {
    expect(canPlace(layout, { column: 3, row: 2, columnSpan: 2, rowSpan: 2 }, 'b')).toBe(true);
    expect(canPlace(layout, { column: 3, row: 2, columnSpan: 2, rowSpan: 2 }, 'a')).toBe(false);
  });
});

describe('validateLayout', () => {
  it('accepts a valid layout', () => {
    expect(validateLayout(layout, widgets)).toEqual([]);
  });

  it('reports missing areas, unknown widgets and overlaps', () => {
    const problems = validateLayout(
      { ...layout, areas: { a: layout.areas['a']!, c: { column: 1, row: 1, columnSpan: 1, rowSpan: 1 } } },
      widgets
    );

    expect(problems).toEqual(
      expect.arrayContaining([
        { kind: 'missing-area', widgetId: 'b' },
        { kind: 'unknown-widget', widgetId: 'c' },
        { kind: 'overlap', widgetId: 'a', otherId: 'c' }
      ])
    );
  });
});

describe('PageSchema', () => {
  const page: Page = { id: 'p', name: 'Page', widgets, layouts: [layout] };

  it('accepts a valid page', () => {
    expect(v.safeParse(PageSchema, page).success).toBe(true);
  });

  it('rejects overlapping widgets', () => {
    const overlapping = { ...layout, areas: { ...layout.areas, a: { column: 2, row: 1, columnSpan: 2, rowSpan: 1 } } };

    expect(v.safeParse(PageSchema, { ...page, layouts: [overlapping] }).success).toBe(false);
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
