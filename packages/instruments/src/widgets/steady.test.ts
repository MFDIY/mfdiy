import { describe, expect, it } from 'vitest';

import { nextSteady, steadyWakeAt, type SteadyOptions, type SteadyState } from './steady.js';

function run(values: readonly (readonly [number, number])[], options: SteadyOptions): SteadyState {
  let state: SteadyState | undefined;

  for (const [now, value] of values) {
    state = nextSteady(state, value, now, options);
  }

  if (!state) {
    throw new Error('No values');
  }

  return state;
}

describe('nextSteady', () => {
  it('shows every value with nothing turned on', () => {
    expect(
      run(
        [
          [0, 10],
          [50, 10.4]
        ],
        { step: 1 }
      ).shown
    ).toBe(10.4);
  });

  it('holds the shown number while the value stays within a step of it', () => {
    const options = { deadband: true, step: 1 };

    expect(
      run(
        [
          [0, 412.3],
          [50, 413.1],
          [100, 411.6]
        ],
        options
      ).shown
    ).toBe(412.3);
    expect(
      run(
        [
          [0, 412.3],
          [50, 413.4]
        ],
        options
      ).shown
    ).toBe(413.4);
  });

  it('shows a new number at most once an interval, and the latest when it comes round', () => {
    const options = { interval: 250, step: 1 };
    const state = run(
      [
        [0, 10],
        [50, 20],
        [100, 30]
      ],
      options
    );

    expect(state.shown).toBe(10);
    expect(steadyWakeAt(state, options)).toBe(250);
    expect(nextSteady(state, 30, 250, options).shown).toBe(30);
  });

  it('rounds to tens while the value moves fast, and shows every digit once it settles', () => {
    const options = { coarseAbove: 40, step: 1 };
    const fast = run(
      Array.from({ length: 10 }, (_, index) => [index * 50, 100 + index * 7.3] as const),
      options
    );

    expect(fast.shown % 10).toBe(0);

    const wakeAt = steadyWakeAt(fast, options) ?? 0;

    expect(nextSteady(fast, fast.raw, wakeAt, options).shown).toBe(fast.raw);
  });

  it('needs no wake-up once the latest value is shown', () => {
    const options = { interval: 250, step: 1 };

    expect(
      steadyWakeAt(
        run(
          [
            [0, 10],
            [300, 20]
          ],
          options
        ),
        options
      )
    ).toBeUndefined();
  });
});
