import { style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

export const readout = style({
  border: `${token('size.border')} solid ${token('outline')}`,
  borderRadius: token('size.radius'),
  gap: '4cqmin',
  padding: '6cqmin'
});

export const label = style({
  color: token('readout.label')
});

export const value = style({
  color: token('readout.value'),
  // Bounded by width too, so long values shrink instead of truncating in narrow cells.
  fontSize: 'clamp(14px, min(32cqmin, 16cqi), 64px)',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1
});

export const unit = style({
  color: token('readout.label'),
  fontSize: '0.45em',
  marginInlineStart: '0.3em'
});
