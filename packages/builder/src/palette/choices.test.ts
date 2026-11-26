import { expect, it } from 'vitest';

import { matches } from './choices.js';

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
