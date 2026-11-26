import { useEffect, useState } from 'react';

import { useMatchesMediaQuery } from '../useMatchesMediaQuery/useMatchesMediaQuery.js';

const TYPING_SPEED = 40;
const HOLD_TIME = 1400;

type Derived = {
  suffix: string;
  nextDelay: number;
};

function derive(elapsed: number, terms: readonly string[]): Derived {
  if (terms.length === 0) return { suffix: '', nextDelay: Infinity };

  const totalCycle = terms.reduce((sum, t) => sum + t.length * TYPING_SPEED * 2 + HOLD_TIME, 0);
  if (totalCycle === 0) return { suffix: '', nextDelay: Infinity };

  const pos = elapsed % totalCycle;
  let cumulative = 0;

  for (const term of terms) {
    const typingEnd = term.length * TYPING_SPEED;
    const pauseEnd = typingEnd + HOLD_TIME;
    const termEnd = pauseEnd + term.length * TYPING_SPEED;

    if (pos < cumulative + termEnd) {
      const local = pos - cumulative;

      if (local < typingEnd) {
        const charCount = Math.floor(local / TYPING_SPEED);
        return { suffix: term.slice(0, charCount), nextDelay: TYPING_SPEED - (local % TYPING_SPEED) };
      }

      if (local < pauseEnd) {
        return { suffix: term, nextDelay: pauseEnd - local };
      }

      const backspaceLocal = local - pauseEnd;
      const charsRemoved = Math.floor(backspaceLocal / TYPING_SPEED);
      return {
        suffix: term.slice(0, term.length - charsRemoved),
        nextDelay: TYPING_SPEED - (backspaceLocal % TYPING_SPEED)
      };
    }

    cumulative += termEnd;
  }

  return { suffix: '', nextDelay: Infinity };
}

/**
 * Returns a string that cycles through `terms`, typing each one character-by-character after a
 * static `prefix`, then backspacing before moving to the next. Forked from Bonsai.
 *
 * Intended for use as a `placeholder` value on an input element, to suggest what can be searched.
 * Pass `false` for `enabled` to pause the animation (e.g. while the user is typing) so no timers run
 * when the placeholder isn't visible. With reduced motion, it shows the first term, still.
 *
 * @example
 * const placeholder = useCyclingPlaceholder(query === '', 'Search ', ['bar', 'hydrogen', 'shields']);
 * // → "Search " → "Search b" → … → "Search bar" → "Search ba" → … → "Search " → …
 */
export function useCyclingPlaceholder(enabled: boolean, prefix: string, terms: readonly string[]): string {
  const reducedMotion = useMatchesMediaQuery('(prefers-reduced-motion: reduce)');
  const animated = enabled && !reducedMotion;
  /** When the animation started and the time now: read from the clock in timers, never while rendering. */
  const [clock, setClock] = useState<{ start: number; now: number } | null>(null);

  const elapsed = animated && clock ? clock.now - clock.start : 0;
  const { suffix, nextDelay } = derive(elapsed, animated ? terms : []);

  useEffect(() => {
    if (!animated) return;
    const id = setTimeout(() => {
      const start = Date.now();
      setClock({ start, now: start });
    });
    return () => {
      clearTimeout(id);
      setClock(null);
    };
  }, [animated]);

  useEffect(() => {
    if (!animated || !clock || nextDelay === Infinity) return;
    const id = setTimeout(() => setClock(current => current && { ...current, now: Date.now() }), nextDelay);
    return () => clearTimeout(id);
  }, [animated, clock, suffix, nextDelay]);

  return reducedMotion ? `${prefix}${terms[0] ?? ''}` : `${prefix}${suffix}`;
}
