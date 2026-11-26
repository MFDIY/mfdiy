import { style } from '@vanilla-extract/css';

/** Only what the design system's classes can't express: the list is at least as wide as the control. */
export const popup = style({
  minWidth: 'var(--anchor-width)'
});
