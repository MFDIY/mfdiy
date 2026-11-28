/**
 * Ways to keep a fast-changing number readable without lagging what it says (0018, "Steadier
 * numbers"). Each can be combined with the others; they're compared side by side before choosing.
 */
export type SteadyOptions = {
  /** Shows fewer digits while the number moves faster than this many steps a second. */
  coarseAbove?: number | undefined;
  /** Changes the number shown only once the value has moved a whole step away from it. */
  deadband?: boolean | undefined;
  /** Shows a new number at most this often, in milliseconds. */
  interval?: number | undefined;
  /** The smallest change shown: one unit of the last digit. */
  step: number;
};

export type SteadyState = {
  /** When the value last arrived. */
  at: number;
  coarseUntil: number;
  /** How fast the value moves, in steps a second, smoothed. */
  rate: number;
  raw: number;
  shown: number;
  shownAt: number;
};

const RATE_TIME_CONSTANT_MS = 250;
const COARSE_HOLD_MS = 600;
const COARSE_FACTOR = 10;

/** What to show after a new value arrives at `now`, or after time passes with the same value. */
export function nextSteady(
  previous: SteadyState | undefined,
  raw: number,
  now: number,
  options: SteadyOptions
): SteadyState {
  if (!previous) {
    return { at: now, coarseUntil: 0, rate: 0, raw, shown: raw, shownAt: now };
  }

  const elapsed = Math.max(1, now - previous.at);
  const instant = Math.abs(raw - previous.raw) / options.step / (elapsed / 1000);
  const rate = previous.rate + (instant - previous.rate) * Math.min(1, elapsed / RATE_TIME_CONSTANT_MS);
  const fast = options.coarseAbove !== undefined && rate > options.coarseAbove;
  const coarseUntil = fast ? now + COARSE_HOLD_MS : previous.coarseUntil;
  const unit = options.coarseAbove !== undefined && now < coarseUntil ? options.step * COARSE_FACTOR : options.step;
  const candidate = unit === options.step ? raw : Math.round(raw / unit) * unit;
  const moved = !options.deadband || Math.abs(raw - previous.shown) >= unit;
  const due = !options.interval || now - previous.shownAt >= options.interval;
  const show = moved && due && candidate !== previous.shown;

  return {
    at: now,
    coarseUntil,
    rate,
    raw,
    shown: show ? candidate : previous.shown,
    shownAt: show ? now : previous.shownAt
  };
}

/** When to look again with no new value: to show the latest after an interval, or to leave coarse digits. */
export function steadyWakeAt(state: SteadyState, options: SteadyOptions): number | undefined {
  const times: number[] = [];

  if (options.interval && state.shown !== state.raw && state.shownAt + options.interval > state.at) {
    times.push(state.shownAt + options.interval);
  }

  if (options.coarseAbove !== undefined && state.coarseUntil > state.at) {
    times.push(state.coarseUntil);
  }

  return times.length > 0 ? Math.min(...times) : undefined;
}
