import { style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

export const bar = style({
  border: `${token('size.border')} solid ${token('outline')}`,
  borderRadius: token('size.radius'),
  gap: '4cqmin',
  gridTemplateRows: 'auto 1fr auto',
  padding: '6cqmin'
});

export const value = style({
  color: token('readout.value'),
  fontSize: 'clamp(12px, 26cqmin, 48px)',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
  transition: transition('color'),

  selectors: {
    [`${bar}[data-state="caution"] &`]: { color: token('state.caution') },
    [`${bar}[data-state="warning"] &`]: { color: token('state.warning') }
  }
});

export const track = style({
  backgroundColor: token('bar.track'),
  borderRadius: token('size.radius'),
  height: 'clamp(4px, 8cqmin, 14px)'
});

export const fill = style({
  backgroundColor: token('bar.fill'),
  boxShadow: glow(token('bar.fill')),
  transition: transition('transform', 'background-color'),

  selectors: {
    [`${bar}[data-state="caution"] &`]: { backgroundColor: token('state.caution') },
    [`${bar}[data-state="warning"] &`]: { backgroundColor: token('state.warning') }
  }
});
