import { style } from '@vanilla-extract/css';

/** Out of sight but still read by assistive technology, e.g. a description shown in a toggletip. */
export const visuallyHidden = style({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px'
});
