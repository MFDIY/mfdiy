import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/** Only Base UI's entrance and exit attributes: everything else is the design system's classes. */
export const toast = style({
  transition: `opacity ${uiVars['duration.long']} ease-out, transform ${uiVars['duration.long']} ease-out`,

  selectors: {
    '&[data-starting-style], &[data-ending-style]': {
      opacity: 0,
      transform: 'translateY(100%)'
    }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  }
});
