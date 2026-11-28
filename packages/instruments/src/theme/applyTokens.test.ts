import { describe, expect, it } from 'vitest';

import { applyTokens } from './applyTokens.js';

describe('applyTokens', () => {
  it('gives a length of 0 a unit, so it can be added to other lengths', () => {
    expect(Object.values(applyTokens({ 'corner.gap': '0' }))).toEqual(['0px']);
    expect(Object.values(applyTokens({ 'corner.gap': '3px' }))).toEqual(['3px']);
  });

  it('drops invalid values', () => {
    expect(applyTokens({ 'corner.gap': 'red' })).toEqual({});
  });
});
