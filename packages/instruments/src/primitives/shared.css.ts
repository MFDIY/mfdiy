import { style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

/**
 * Every primitive fills its grid cell and is a size container, so it scales with the cell rather
 * than the viewport (see docs/decisions/0001). Sizes are expressed in `cqmin`.
 */
export const cell = style({
  containerType: 'size',
  height: '100%',
  minHeight: 0,
  minWidth: 0,
  width: '100%'
});

/**
 * The visible element inside a `cell`. Container query units on an element resolve against its
 * *ancestor* container, so anything sized in `cqmin` (padding, borders) must live on this inner
 * element, never on the container itself.
 */
export const frame = style({
  boxSizing: 'border-box',
  height: '100%',
  position: 'relative',
  width: '100%'
});

export const label = style({
  color: token('text.dim'),
  fontSize: 'clamp(9px, 12cqmin, 18px)',
  letterSpacing: '0.12em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap'
});
