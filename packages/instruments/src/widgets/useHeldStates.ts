import type { SignalState } from '@mfdiy/schema';

import { useEffect, useState } from 'react';

const severity: Record<SignalState, number> = { normal: 0, warning: 1, critical: 2 };

/**
 * Steadies states (0023): a state rises at once, so a warning is never late, but falls back only
 * after the value has stayed back for that input's hold, in seconds. Keyed by input; an input
 * without a hold follows its state directly. Only the state is held: the value stays live.
 */
export function useHeldStates(
  states: Readonly<Record<string, SignalState>>,
  holdSeconds: Readonly<Record<string, number | undefined>>
): Record<string, SignalState> {
  const [shown, setShown] = useState<Record<string, SignalState>>(states);
  const next: Record<string, SignalState> = {};

  for (const [input, state] of Object.entries(states)) {
    const previous = shown[input] ?? 'normal';
    const held = (holdSeconds[input] ?? 0) > 0 && severity[state] < severity[previous];

    next[input] = held ? previous : state;
  }

  const changed =
    Object.keys(next).length !== Object.keys(shown).length ||
    Object.entries(next).some(([input, state]) => shown[input] !== state);

  if (changed) {
    setShown(next);
  }

  const waiting = Object.entries(next)
    .filter(([input, state]) => states[input] !== state)
    .map(([input]) => `${input}:${states[input]}:${holdSeconds[input]}`)
    .join(',');

  useEffect(() => {
    if (waiting === '') {
      return;
    }

    const timers = waiting.split(',').map(entry => {
      const [input = '', state = 'normal', seconds = '0'] = entry.split(':');

      return setTimeout(
        () => {
          setShown(current => ({ ...current, [input]: state as SignalState }));
        },
        Number(seconds) * 1000
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [waiting]);

  return next;
}
