import { style } from '@vanilla-extract/css';

/** Only what the design system's classes can't express: the menu fits the room Base UI says it has. */
export const popup = style({
  maxHeight: 'var(--available-height)'
});
