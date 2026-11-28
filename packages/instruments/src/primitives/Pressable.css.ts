import { createVar, keyframes, style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

const cueColor = createVar();
const thickness = token('corner.width');
const corner = `calc(clamp(6px, 16cqmin, 16px) + ${thickness})`;

const angle = createVar({ syntax: '<angle>', inherits: false, initialValue: '0deg' });

const spin = keyframes({ to: { [angle]: '360deg' } });
const appear = keyframes({ to: { opacity: 1 } });

/**
 * Room around every widget, pressable or not, so they line up: the outermost box of a widget, where
 * a pressable one draws its corners, with air between them and the widget (0018).
 */
export const cornerBox = style({
  padding: `calc(${thickness} + ${token('corner.gap')})`
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
  vars: { [cueColor]: token('press.cue') },

  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${token('accent')}`,
      outlineOffset: '2px'
    },
    '&[data-status="ok"]': {
      vars: { [cueColor]: token('press.accepted') }
    },
    '&[data-status="failed"]': {
      outline: `2px solid ${token('press.failed')}`,
      outlineOffset: '2px',
      vars: { [cueColor]: token('press.failed') }
    },
    '&:disabled': {
      opacity: 0.4
    }
  }
});

export const cue = style({
  background: [
    `linear-gradient(${cueColor}, ${cueColor}) top left / ${corner} ${thickness}`,
    `linear-gradient(${cueColor}, ${cueColor}) top left / ${thickness} ${corner}`,
    `linear-gradient(${cueColor}, ${cueColor}) top right / ${corner} ${thickness}`,
    `linear-gradient(${cueColor}, ${cueColor}) top right / ${thickness} ${corner}`,
    `linear-gradient(${cueColor}, ${cueColor}) bottom left / ${corner} ${thickness}`,
    `linear-gradient(${cueColor}, ${cueColor}) bottom left / ${thickness} ${corner}`,
    `linear-gradient(${cueColor}, ${cueColor}) bottom right / ${corner} ${thickness}`,
    `linear-gradient(${cueColor}, ${cueColor}) bottom right / ${thickness} ${corner}`
  ].join(', '),
  backgroundRepeat: 'no-repeat',
  transition: transition('background', 'filter'),

  selectors: {
    [`${pressable}[data-status="ok"] &`]: {
      filter: `drop-shadow(${glow(cueColor)})`
    }
  }
});

/** A light running around the edge while the game hasn't answered yet; only after a moment, so quick answers don't flash. */
export const busy = style({
  borderRadius: token('radius'),
  display: 'none',
  padding: `max(${thickness}, 1px)`,
  background: `conic-gradient(from ${angle}, transparent 0deg 250deg, ${token('press.pending')} 330deg, transparent 360deg)`,
  mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
  opacity: 0,
  animation: `${appear} 0s 150ms forwards, ${spin} 1.2s linear infinite`,

  selectors: {
    [`${pressable}[data-status="pending"] &`]: { display: 'block' }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      background: token('press.pending'),
      opacity: 1
    }
  }
});
