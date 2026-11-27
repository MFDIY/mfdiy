import type { NumberSignal } from '@mfdiy/schema';

import { describe, expect, it } from 'vitest';

import { atDefaults, inputSummary } from './inputs.js';

const fuel: NumberSignal = {
  id: 'fuel',
  label: 'Hydrogen fuel',
  group: 'Fuel',
  kind: 'number',
  min: 0,
  max: 100,
  unit: '%',
  thresholds: { low: { warning: 25, critical: 10 } }
};

describe('inputSummary', () => {
  it('names the signal and its thresholds', () => {
    expect(inputSummary({ signal: 'fuel', thresholds: { low: { warning: 25, critical: 10 } } }, fuel)).toBe(
      'Hydrogen fuel · low 25 / 10 %'
    );
    expect(inputSummary({ signal: 'fuel', thresholds: { high: { warning: 7 }, low: { critical: 5 } } }, fuel)).toBe(
      'Hydrogen fuel · low 5 % · high 7 %'
    );
  });

  it('says when nothing is connected', () => {
    expect(inputSummary(undefined, undefined)).toBe('Not connected');
  });
});

describe('atDefaults', () => {
  it('compares levels, whatever order they were written in', () => {
    expect(atDefaults({ signal: 'fuel', thresholds: { low: { critical: 10, warning: 25 } } }, fuel)).toBe(true);
  });

  it('notices a changed level or a hold', () => {
    expect(atDefaults({ signal: 'fuel', thresholds: { low: { warning: 30, critical: 10 } } }, fuel)).toBe(false);
    expect(atDefaults({ signal: 'fuel', thresholds: fuel.thresholds, holdSeconds: 1 }, fuel)).toBe(false);
    expect(atDefaults({ signal: 'fuel' }, fuel)).toBe(false);
  });
});
