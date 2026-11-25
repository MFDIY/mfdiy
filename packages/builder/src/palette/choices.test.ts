import type { Catalogue } from './choices.js';

import { barManifest, buttonManifest, lightManifest, readoutManifest } from '@mfdiy/instruments';
import { describe, expect, it } from 'vitest';

import { listChoices, matches, searchChoices } from './choices.js';

const catalogue: Catalogue = {
  signals: [
    { id: 'fuel.hydrogen', label: 'Hydrogen fuel', group: 'Fuel', kind: 'number', min: 0, max: 100 },
    { id: 'vehicle.gear-down', label: 'Landing gear down', group: 'Vehicle', kind: 'boolean' },
    { id: 'fuel.quantum', label: 'Quantum fuel', group: 'Fuel', kind: 'number', min: 0, max: 100 }
  ],
  actions: [{ id: 'vehicle.gear-toggle', label: 'Landing gear', group: 'Vehicle', holdable: false }]
};

const ids = (choices: { id: string }[] | undefined) => choices?.map(choice => choice.id.split(' ')[1]);

describe('listChoices', () => {
  it('only offers signals the widget can show', () => {
    expect(ids(listChoices(barManifest, catalogue))).toEqual(['fuel.hydrogen', 'fuel.quantum']);
    expect(ids(listChoices(lightManifest, catalogue))).toEqual(['vehicle.gear-down']);
    expect(ids(listChoices(readoutManifest, catalogue))).toHaveLength(3);
  });

  it('connects the widget', () => {
    expect(listChoices(barManifest, catalogue)?.[0]?.widget).toEqual({
      type: 'bar',
      bindings: { value: { signal: 'fuel.hydrogen' } }
    });
    expect(listChoices(buttonManifest, catalogue)?.[0]?.widget).toEqual({
      type: 'button',
      action: 'vehicle.gear-toggle'
    });
  });

  it('has nothing to offer for widgets without inputs or actions', () => {
    expect(listChoices({ ...buttonManifest, actionable: false }, catalogue)).toBeUndefined();
  });
});

describe('searchChoices', () => {
  const choices = [barManifest, readoutManifest, buttonManifest].flatMap(
    manifest => listChoices(manifest, catalogue) ?? []
  );

  const found = (search: string) => searchChoices(choices, search).map(choice => choice.id);

  it('finds every widget that can show something', () => {
    expect(found('hyd')).toEqual(['bar fuel.hydrogen', 'readout fuel.hydrogen']);
  });

  it('searches words in labels, groups and widget names, in any order', () => {
    expect(found(' BAR  hyd ')).toEqual(['bar fuel.hydrogen']);
    expect(found('vehicle button')).toEqual(['button vehicle.gear-toggle']);
    expect(found('nothing')).toEqual([]);
  });

  it('puts labels that start with the search first', () => {
    const [hydrogen] = found('fuel');

    expect(hydrogen).toBe('bar fuel.hydrogen');
    expect(found('quantum fuel')[0]).toBe('bar fuel.quantum');
    expect(found('l')[0]).toBe('readout vehicle.gear-down');
  });
});

it('matches from the start of words', () => {
  expect(matches('ESP Flight assist', 'light')).toBe(false);
  expect(matches('ESP Flight assist', 'assi fl')).toBe(true);
  expect(matches('G-safe', 'g-safe')).toBe(true);
  expect(matches('G-safe', 'safe')).toBe(true);
});

it('matches anything while nothing is searched for', () => {
  expect(matches('Bar', '')).toBe(true);
  expect(matches('Bar', '  ')).toBe(true);
});
