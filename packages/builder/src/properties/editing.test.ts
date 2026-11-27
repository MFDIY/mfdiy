import type { Catalogue } from '../palette/choices.js';
import type { Layout, Page } from '@mfdiy/schema';

import { barManifest, buttonManifest, lightManifest, readoutManifest } from '@mfdiy/instruments';
import { describe, expect, it } from 'vitest';

import { placeWidget, resizeGrid, swapType, withBinding, withOption } from './editing.js';

const catalogue: Catalogue = {
  signals: [
    { id: 'speed', label: 'Speed', group: 'Flight', kind: 'number', min: 0, max: 1200, unit: 'm/s' },
    { id: 'gear', label: 'Gear', group: 'Vehicle', kind: 'boolean' }
  ],
  actions: [{ id: 'gear-toggle', label: 'Landing gear', group: 'Vehicle', holdable: false }]
};

describe('swapType', () => {
  it('keeps everything the new type can show', () => {
    const readout = { id: 'r', type: 'readout', options: { label: 'SPD' }, bindings: { value: { signal: 'speed' } } };

    expect(swapType(readout, readoutManifest, barManifest, catalogue)).toEqual({
      widget: { id: 'r', type: 'bar', options: { label: 'SPD' }, bindings: { value: { signal: 'speed' } } },
      lost: []
    });
  });

  it('lists what the new type drops', () => {
    const readout = {
      id: 'r',
      type: 'readout',
      options: { label: 'Gear', decimals: 1 },
      bindings: { value: { signal: 'gear' } }
    };

    expect(swapType(readout, readoutManifest, barManifest, catalogue)).toEqual({
      widget: { id: 'r', type: 'bar', options: { label: 'Gear' } },
      lost: ['Decimals', 'Value: Gear']
    });
  });

  it('keeps the action for a type that takes one', () => {
    const light = { id: 'l', type: 'light', action: 'gear-toggle', bindings: { value: { signal: 'gear' } } };

    expect(swapType(light, lightManifest, buttonManifest, catalogue)).toEqual({
      widget: { id: 'l', type: 'button', action: 'gear-toggle' },
      lost: ['Lit by: Gear']
    });
    expect(swapType(light, lightManifest, readoutManifest, catalogue).lost).toEqual(['Action: Landing gear']);
  });
});

describe('small changes', () => {
  it('leaves out what is empty', () => {
    expect(withBinding({ id: 'b', type: 'bar', bindings: { value: { signal: 'speed' } } }, 'value', undefined)).toEqual(
      { id: 'b', type: 'bar' }
    );
    expect(withOption({ id: 'b', type: 'bar', options: { label: 'X' } }, 'label', undefined)).toEqual({
      id: 'b',
      type: 'bar'
    });
  });
});

const layout: Layout = {
  orientation: 'any',
  grid: { columns: 24, rows: 16 },
  areas: { bar: { column: 21, row: 1, columnSpan: 4, rowSpan: 4 } }
};
const page: Page = { id: 'p', name: 'Page', widgets: [{ id: 'bar', type: 'bar' }], layouts: [layout] };

describe('placeWidget', () => {
  it('keeps the widget on the grid when it grows past the edge', () => {
    const next = placeWidget(page, layout, 'bar', { column: 21, row: 1, columnSpan: 6, rowSpan: 4 });

    expect(next.layouts[0]?.areas['bar']).toEqual({ column: 19, row: 1, columnSpan: 6, rowSpan: 4 });
  });

  it('never goes below one cell or past the grid', () => {
    const next = placeWidget(page, layout, 'bar', { column: 40, row: 0, columnSpan: 0, rowSpan: 30 });

    expect(next.layouts[0]?.areas['bar']).toEqual({ column: 24, row: 1, columnSpan: 1, rowSpan: 16 });
  });
});

describe('resizeGrid', () => {
  it('scales widgets to the same share of the page', () => {
    const next = resizeGrid(page, layout, { columns: 12, rows: 8 });

    expect(next.layouts[0]?.grid).toEqual({ columns: 12, rows: 8 });
    expect(next.layouts[0]?.areas['bar']).toEqual({ column: 11, row: 1, columnSpan: 2, rowSpan: 2 });
  });
});
