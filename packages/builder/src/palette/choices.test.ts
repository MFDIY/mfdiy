import type { Catalogue } from './choices.js';

import { barManifest, buttonManifest, lightManifest, readoutManifest } from '@mfdiy/instruments';
import { describe, expect, it } from 'vitest';

import { groupChoices, listChoices } from './choices.js';

const catalogue: Catalogue = {
  signals: [
    { id: 'fuel.hydrogen', label: 'Hydrogen fuel', group: 'Fuel', kind: 'number', min: 0, max: 100 },
    { id: 'vehicle.gear-down', label: 'Landing gear down', group: 'Vehicle', kind: 'boolean' },
    { id: 'fuel.quantum', label: 'Quantum fuel', group: 'Fuel', kind: 'number', min: 0, max: 100 }
  ],
  actions: [{ id: 'vehicle.gear-toggle', label: 'Landing gear', group: 'Vehicle', holdable: false }]
};

const ids = (choices: { id: string }[] | undefined) => choices?.map(choice => choice.id);

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

describe('groupChoices', () => {
  const choices = listChoices(readoutManifest, catalogue) ?? [];

  it('groups in catalogue order', () => {
    expect(groupChoices(choices, '').map(group => [group.name, ids(group.choices)])).toEqual([
      ['Fuel', ['fuel.hydrogen', 'fuel.quantum']],
      ['Vehicle', ['vehicle.gear-down']]
    ]);
  });

  it('searches words in labels and groups, in any order', () => {
    expect(groupChoices(choices, ' FUEL  hyd ').flatMap(group => ids(group.choices))).toEqual(['fuel.hydrogen']);
    expect(groupChoices(choices, 'vehicle').flatMap(group => ids(group.choices))).toEqual(['vehicle.gear-down']);
    expect(groupChoices(choices, 'nothing')).toEqual([]);
  });
});
