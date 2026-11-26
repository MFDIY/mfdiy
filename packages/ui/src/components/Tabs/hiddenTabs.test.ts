import { describe, expect, it } from 'vitest';

import { hiddenTabs } from './hiddenTabs.js';

const widths = [60, 60, 60, 60, 60];

describe('hiddenTabs', () => {
  it('hides nothing when every tab fits', () => {
    expect(hiddenTabs(widths, 0, 300, 40)).toEqual(new Set());
  });

  it('keeps room for the menu button once something has to go', () => {
    // 250 fits four tabs (240), but only three and the button (220).
    expect(hiddenTabs(widths, 0, 250, 40)).toEqual(new Set([3, 4]));
  });

  it('always shows the active tab, in place of the last ones that fit', () => {
    expect(hiddenTabs(widths, 4, 200, 40)).toEqual(new Set([1, 2, 3]));
  });

  it('shows the active tab even when nothing else fits', () => {
    expect(hiddenTabs(widths, 2, 50, 40)).toEqual(new Set([0, 1, 3, 4]));
  });

  it('hides nothing when there are no tabs', () => {
    expect(hiddenTabs([], -1, 100, 40)).toEqual(new Set());
  });
});
