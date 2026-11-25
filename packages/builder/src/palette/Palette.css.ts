import { token } from '@mfdiy/instruments';
import { style } from '@vanilla-extract/css';

export const tiles = style({
  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))'
});

/** About the shape of a new widget on a tablet. */
export const preview = style({
  backgroundColor: token('surface'),
  height: '72px',
  padding: '6px'
});
