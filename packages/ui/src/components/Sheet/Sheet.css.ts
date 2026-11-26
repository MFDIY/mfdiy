import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/*
 * Only what the design system's classes can't express. Base UI's Drawer positions the sheet through
 * CSS variables it sets while it rests at a stop (`--drawer-snap-point-offset`) and while it's
 * dragged (`--drawer-swipe-movement-y`), and marks its entrance and exit with data attributes.
 */
const offset = 'calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px))';

export const popup = style({
  // What's below the screen's edge at the half stop isn't part of the visible sheet.
  paddingBottom: `max(0px, ${offset})`,
  transform: `translateY(${offset})`,
  transition: `transform ${uiVars['duration.long']} cubic-bezier(0.32, 0.72, 0, 1)`,
  willChange: 'transform',

  selectors: {
    '&[data-starting-style], &[data-ending-style]': {
      paddingBottom: 0,
      transform: 'translateY(100%)'
    },
    '&[data-swiping]': {
      transition: 'none',
      userSelect: 'none'
    }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  }
});
