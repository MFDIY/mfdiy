import { createVar, keyframes, style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

const thickness = token('corner.width');
const corner = `calc(clamp(6px, 16cqmin, 16px) + ${thickness})`;
const room = `calc(${thickness} + ${token('corner.gap')})`;
const color = token('press.cue');

/** Where the tap landed, inside the tap layer. */
export const tapX = createVar();
export const tapY = createVar();

const angle = createVar({ syntax: '<angle>', inherits: false, initialValue: '0deg' });

const spin = keyframes({ to: { vars: { [angle]: '360deg' } } });
const appear = keyframes({ to: { opacity: 1 } });
const pulse = keyframes({ '50%': { opacity: 0.3 } });
const spread = keyframes({
  from: { opacity: 0.35, transform: 'translate(-50%, -50%) scale(0)' },
  to: { opacity: 0, transform: 'translate(-50%, -50%) scale(1)' }
});

/** Fades the rim out after accepted or refused; the end of a press's feedback. */
export const fade = keyframes({ to: { opacity: 0 } });

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
    [`${pressable}[aria-disabled="true"] &`]: { opacity: 0.3 }
  }
});

/**
 * A solid rim in the corner box, over the corners, while a press is answered: a light running
 * around it while the game hasn't answered yet (only after a moment, so quick answers don't
 * flash), then pulsing in `press.accepted`, or in `press.failed` twice as fast for twice as long.
 */
export const rim = style({
  borderRadius: token('radius'),
  display: 'none',
  mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
  padding: thickness,

  selectors: {
    [`${pressable}[data-rim="pending"] &`]: {
      animation: `${appear} 0s 150ms forwards, ${spin} 1.2s linear infinite`,
      background: `conic-gradient(from ${angle}, transparent 0deg 200deg, ${token('press.pending')} 340deg, transparent 360deg)`,
      display: 'block',
      opacity: 0
    },
    [`${pressable}[data-rim="accepted"] &`]: {
      animation: `${pulse} 300ms ease-in-out 2, ${fade} 200ms ease-in 600ms forwards`,
      background: token('press.accepted'),
      display: 'block',
      filter: `drop-shadow(${glow(token('press.accepted'))})`
    },
    [`${pressable}[data-rim="refused"] &`]: {
      animation: `${pulse} 150ms ease-in-out 8, ${fade} 200ms ease-in 1200ms forwards`,
      background: token('press.failed'),
      display: 'block',
      filter: `drop-shadow(${glow(token('press.failed'))})`
    }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        [`${pressable}[data-rim="pending"] &`]: {
          animation: 'none',
          background: token('press.pending'),
          opacity: 1
        },
        [`${pressable}[data-rim="accepted"] &`]: { animation: `${fade} 200ms ease-in 600ms forwards` },
        [`${pressable}[data-rim="refused"] &`]: { animation: `${fade} 200ms ease-in 1200ms forwards` }
      }
    }
  }
});

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
