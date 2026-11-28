import { useEffect, useState } from 'react';

import { nextSteady, steadyWakeAt, type SteadyOptions, type SteadyState } from './steady.js';

/**
 * The number to show for a fast-changing value, steadied as `options` ask (0018). With no options
 * set, it's the value itself. Thresholds are never judged on what this returns, only on the value.
 */
export function useSteadyNumber(value: number | null, options: SteadyOptions): number | null {
  const { coarseAbove, deadband, interval, step } = options;
  const steadied = coarseAbove !== undefined || deadband === true || interval !== undefined;
  const [state, setState] = useState<SteadyState | undefined>(undefined);

  useEffect(() => {
    if (value === null || !steadied) {
      return;
    }

    const current = { coarseAbove, deadband, interval, step };
    const wakeAt = state?.raw === value ? steadyWakeAt(state, current) : performance.now();

    if (wakeAt === undefined) {
      return;
    }

    const timer = setTimeout(
      () => setState(previous => nextSteady(previous, value, performance.now(), current)),
      Math.max(0, wakeAt - performance.now())
    );

    return () => clearTimeout(timer);
  }, [coarseAbove, deadband, interval, state, steadied, step, value]);

  if (value === null || !steadied) {
    return value;
  }

  return state?.shown ?? value;
}
