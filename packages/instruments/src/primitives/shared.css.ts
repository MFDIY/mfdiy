import { style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

export const label = style({
  color: token('text.dim'),
  fontSize: 'clamp(9px, 12cqmin, 18px)',
  letterSpacing: '0.12em',
  textTransform: 'uppercase'
});
