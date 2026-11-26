import { style } from '@vanilla-extract/css';

import { fontFamily, token } from '../theme/token.js';

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
  color: token('readout.value'),
  fontFamily: fontFamily('font.numeric'),
  // Bounded by width too, so long values shrink instead of truncating in narrow cells.
  fontSize: 'clamp(14px, min(32cqmin, 16cqi), 64px)',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1
});

export const unit = style({
  color: token('readout.unit'),
  fontSize: '0.45em',
  marginInlineStart: '0.3em'
});
