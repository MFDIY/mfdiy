import { keyframes, style } from '@vanilla-extract/css';

import { fontFamily, token } from '../theme/token.js';

import { transition } from './styleHelpers.js';

export const readout = style({
  border: `${token('border.width')} solid ${token('line')}`,
  borderRadius: token('radius'),
  gap: '4cqmin',
  padding: '6cqmin'
});

export const label = style({
  color: token('readout.label')
});

export const value = style({
  alignItems: 'baseline',
  color: token('readout.value'),
  fontFamily: fontFamily('font.numeric'),
  // Bounded by width too, so long values shrink instead of truncating in narrow cells.
  fontSize: 'clamp(14px, min(32cqmin, 16cqi), 64px)',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
  transition: transition('color'),
  whiteSpace: 'nowrap',

  selectors: {
    [`${readout}[data-state="warning"] &`]: { color: token('status.warning') },
    [`${readout}[data-state="critical"] &`]: { color: token('status.critical') }
  }
});

export const zeros = style({
  color: token('readout.zeros')
});

export const unit = style({
  color: token('readout.unit'),
  fontSize: '0.45em',
  marginInlineStart: '0.3em'
});

const inFromBelow = keyframes({ from: { transform: 'translateY(100%)' } });
const inFromAbove = keyframes({ from: { transform: 'translateY(-100%)' } });
const outUpwards = keyframes({ to: { transform: 'translateY(-100%)' } });
const outDownwards = keyframes({ to: { transform: 'translateY(100%)' } });

export const cell = style({
  height: '1em',
  verticalAlign: 'bottom'
});

export const rollIn = style({
  animation: `${inFromBelow} ${token('duration')} ease-out`,

  selectors: {
    [`${cell}[data-direction="down"] > &`]: { animationName: inFromAbove }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' }
  }
});

export const rollOut = style({
  animation: `${outUpwards} ${token('duration')} ease-out forwards`,

  selectors: {
    [`${cell}[data-direction="down"] > &`]: { animationName: outDownwards }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': { display: 'none' }
  }
});
