import { createVar, keyframes, style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

const thickness = token('corner.width');
const corner = `calc(clamp(6px, 16cqmin, 16px) + ${thickness})`;
const room = `calc(${thickness} + ${token('corner.gap')})`;
const color = token('press.cue');
const pending = token('press.pending');

/** How long the game's answer shows: one slow pulse when accepted, three when refused. */
const answer = '1200ms';

/** Where the tap landed, inside the tap layer. */
export const tapX = createVar();
export const tapY = createVar();

const angle = createVar({ syntax: '<angle>', inherits: false, initialValue: '0deg' });

const spin = keyframes({ to: { vars: { [angle]: '360deg' } } });
const spread = keyframes({
  from: { opacity: 0.35, transform: 'translate(-50%, -50%) scale(0)' },
  to: { opacity: 0, transform: 'translate(-50%, -50%) scale(1)' }
});

/** One pulse of the answer's rim; its end, or `hold`'s with reduced motion, ends a refusal shown without asking the game. */
export const pulse = keyframes({ '50%': { opacity: 0.25 } });
export const hold = keyframes({ to: { opacity: 1 } });

/**
 * Room around every widget, pressable or not, so they line up: the outermost box of a widget, where
 * a pressable one draws its corners, with air between them and the widget (0018).
 */
export const cornerBox = style({
  padding: room
});

export const pressable = style({
  appearance: 'none',
  backgroundColor: 'transparent',
  border: 'none',
  color: 'inherit',
  display: 'block',
  font: 'inherit',
  textAlign: 'inherit',
  WebkitTapHighlightColor: 'transparent',
  WebkitUserSelect: 'none',

  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${token('accent')}`,
      outlineOffset: '2px'
    }
  }
});

/** The corners: hidden while a rim shows the game's answer, and while the action can't be used. */
export const cue = style({
  background: [
    `linear-gradient(${color}, ${color}) top left / ${corner} ${thickness}`,
    `linear-gradient(${color}, ${color}) top left / ${thickness} ${corner}`,
    `linear-gradient(${color}, ${color}) top right / ${corner} ${thickness}`,
    `linear-gradient(${color}, ${color}) top right / ${thickness} ${corner}`,
    `linear-gradient(${color}, ${color}) bottom left / ${corner} ${thickness}`,
    `linear-gradient(${color}, ${color}) bottom left / ${thickness} ${corner}`,
    `linear-gradient(${color}, ${color}) bottom right / ${corner} ${thickness}`,
    `linear-gradient(${color}, ${color}) bottom right / ${thickness} ${corner}`
  ].join(', '),
  backgroundRepeat: 'no-repeat',
  transition: transition('opacity'),

  selectors: {
    [`${pressable}[data-rim] &, ${pressable}[aria-disabled="true"] &`]: { opacity: 0 },
    [`${pressable}[data-rim="pending"] &`]: { transitionDelay: '150ms' }
  }
});

const rim = style({
  borderRadius: token('radius'),
  mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
  opacity: 0,
  padding: thickness,
  transition: transition('opacity')
});

/**
 * Waiting for the game: two lights chasing around a faint rim, shown only after a moment, so the
 * usual quick answer doesn't flash.
 */
export const waiting = style([
  rim,
  {
    background: [
      `conic-gradient(from ${angle}, transparent 0deg 110deg, ${pending} 175deg, transparent 180deg 290deg, ${pending} 355deg, transparent 360deg)`,
      `color-mix(in srgb, ${pending} 20%, transparent)`
    ].join(', '),

    selectors: {
      [`${pressable}[data-rim="pending"] &`]: {
        animation: `${spin} 1.6s linear infinite`,
        opacity: 1,
        transitionDelay: '150ms'
      }
    },

    '@media': {
      '(prefers-reduced-motion: reduce)': {
        background: pending,

        selectors: {
          [`${pressable}[data-rim="pending"] &`]: { animation: 'none' }
        }
      }
    }
  }
]);

/** Accepted: the rim turns solid and pulses once, slowly. */
export const accepted = style([
  rim,
  {
    backgroundColor: token('press.accepted'),
    filter: `drop-shadow(${glow(token('press.accepted'))})`,

    selectors: {
      [`${pressable}[data-rim="accepted"] &`]: { animation: `${pulse} ${answer} ease-in-out`, opacity: 1 }
    },

    '@media': {
      '(prefers-reduced-motion: reduce)': {
        selectors: {
          [`${pressable}[data-rim="accepted"] &`]: { animation: 'none' }
        }
      }
    }
  }
]);

/** Refused: the rim turns solid critical and pulses three times in the time accepted pulses once. */
export const refused = style([
  rim,
  {
    backgroundColor: token('press.failed'),
    filter: `drop-shadow(${glow(token('press.failed'))})`,

    selectors: {
      [`${pressable}[data-rim="refused"] &`]: {
        animation: `${pulse} calc(${answer} / 3) ease-in-out 3`,
        opacity: 1
      }
    },

    '@media': {
      '(prefers-reduced-motion: reduce)': {
        selectors: {
          [`${pressable}[data-rim="refused"] &`]: { animation: `${hold} ${answer}` }
        }
      }
    }
  }
]);

/** The tap feedback's layer: the widget's content box, which clips it (0022). */
export const tapLayer = style({
  borderRadius: token('radius'),
  inset: `calc(${room} + ${token('border.width')})`,
  overflow: 'hidden'
});

export const tap = style({
  animation: `${spread} calc(${token('duration')} * 2) ease-out forwards`,
  aspectRatio: '1',
  backgroundColor: token('press.ripple'),
  borderRadius: '50%',
  left: tapX,
  top: tapY,
  width: '300cqmax',

  '@media': {
    '(prefers-reduced-motion: reduce)': { display: 'none' }
  }
});
