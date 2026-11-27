import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/** Items sit flush, with a hairline between them, never around them (0022). */
export const item = style({
  selectors: {
    '& + &': { borderTop: `${uiVars['border.hairline']} solid ${uiVars['line']}` }
  }
});

/** The open item's trigger, as Base UI marks it. */
export const trigger = style({});

/** Points down while closed, up while open. */
export const chevron = style({
  transition: `transform ${uiVars['duration.short']} ease-out`,

  selectors: {
    [`${trigger}[data-panel-open] &`]: { transform: 'rotate(180deg)' }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  }
});
