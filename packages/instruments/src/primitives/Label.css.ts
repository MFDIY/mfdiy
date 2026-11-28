import { style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { pressable } from './Pressable.css.js';

export const label = style({
  border: `${token('border.width')} solid transparent`,
  borderRadius: token('radius'),
  color: token('text'),
  fontSize: 'clamp(10px, 24cqmin, 22px)',
  letterSpacing: token('label.tracking'),
  padding: '0 6cqmin',
  textTransform: token('label.case') as 'uppercase',

  selectors: {
    [`${pressable} &`]: { borderColor: token('line') }
  }
});
