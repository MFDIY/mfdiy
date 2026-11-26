import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/** Only what the design system's classes can't express: the knob slides on Base UI's `data-checked`. */
export const thumb = style({
  transition: `transform ${uiVars['duration.short']} ease-out`,

  selectors: {
    '&[data-checked]': {
      transform: `translateX(${uiVars['spacing.4x']})`
    }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  }
});
