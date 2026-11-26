import { style } from '@vanilla-extract/css';

import { fontFamily, token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

export const bar = style({
  border: `${token('border.width')} solid ${token('line')}`,
  borderRadius: token('radius'),
  gap: '4cqmin',
  gridTemplateRows: 'auto 1fr auto',
  padding: '6cqmin'
});

export const value = style({
  color: token('bar.value'),
  fontFamily: fontFamily('font.numeric'),
  fontSize: 'clamp(12px, 26cqmin, 48px)',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
  transition: transition('color'),

  selectors: {
    [`${bar}[data-state="warning"] &`]: { color: token('bar.fill.warning') },
    [`${bar}[data-state="critical"] &`]: { color: token('bar.fill.critical') }
  }
});

export const track = style({
  backgroundColor: token('bar.track'),
  borderRadius: token('radius'),
  height: 'clamp(4px, 8cqmin, 14px)'
});

export const fill = style({
  backgroundColor: token('bar.fill'),
  boxShadow: glow(token('bar.fill')),
  transition: transition('transform', 'background-color'),

  selectors: {
    [`${bar}[data-state="warning"] &`]: { backgroundColor: token('bar.fill.warning') },
    [`${bar}[data-state="critical"] &`]: { backgroundColor: token('bar.fill.critical') }
  }
});
