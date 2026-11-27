import { describe, expect, it } from 'vitest';

import { createBlankDocument } from './blankDocument.js';
import { bindingFor, thresholdState, withDefaultThresholds } from './thresholds.js';

describe('thresholdState', () => {
  const fuel = { low: { warning: 25, critical: 10 } };
  const gForce = { high: { warning: 7, critical: 9 }, low: { warning: -3, critical: -5 } };

  it('is normal without thresholds or a number', () => {
    expect(thresholdState(5, undefined)).toBe('normal');
    expect(thresholdState(null, fuel)).toBe('normal');
    expect(thresholdState(true, fuel)).toBe('normal');
  });

  it('warns and turns critical below the low levels, at the level itself too', () => {
    expect(thresholdState(26, fuel)).toBe('normal');
    expect(thresholdState(25, fuel)).toBe('warning');
    expect(thresholdState(10, fuel)).toBe('critical');
    expect(thresholdState(0, fuel)).toBe('critical');
  });

  it('checks both sides', () => {
    expect(thresholdState(1, gForce)).toBe('normal');
    expect(thresholdState(7.5, gForce)).toBe('warning');
    expect(thresholdState(9, gForce)).toBe('critical');
    expect(thresholdState(-4, gForce)).toBe('warning');
    expect(thresholdState(-6, gForce)).toBe('critical');
  });

  it('skips a level that is left out', () => {
    expect(thresholdState(5, { low: { critical: 10 } })).toBe('critical');
    expect(thresholdState(15, { low: { critical: 10 } })).toBe('normal');
    expect(thresholdState(15, { low: { warning: 20 } })).toBe('warning');
  });
});

describe('default thresholds', () => {
  const fuel = {
    id: 'fuel',
    label: 'Fuel',
    group: 'Fuel',
    kind: 'number',
    min: 0,
    max: 100,
    unit: '%',
    thresholds: { low: { warning: 25, critical: 10 } }
  } as const;

  it('copies them into a new binding', () => {
    const binding = bindingFor(fuel);

    expect(binding).toEqual({ signal: 'fuel', thresholds: { low: { warning: 25, critical: 10 } } });
    expect(binding.thresholds).not.toBe(fuel.thresholds);
    expect(bindingFor({ id: 'gear', label: 'Gear', group: 'Vehicle', kind: 'boolean' })).toEqual({ signal: 'gear' });
  });

  it('fills in bindings without thresholds, and keeps those with', () => {
    const document = createBlankDocument('Test', 'game');
    const page = document.pages[0];
    const own = { low: { warning: 50 } };
    const widgets = [
      { id: 'a', type: 'bar', bindings: { value: { signal: 'fuel' } } },
      { id: 'b', type: 'bar', bindings: { value: { signal: 'fuel', thresholds: own } } }
    ];
    const filled = withDefaultThresholds({ ...document, pages: page ? [{ ...page, widgets }] : [] }, [fuel]);

    expect(filled.pages[0]?.widgets[0]?.bindings?.['value']?.thresholds).toEqual(fuel.thresholds);
    expect(filled.pages[0]?.widgets[1]?.bindings?.['value']?.thresholds).toBe(own);
  });
});
