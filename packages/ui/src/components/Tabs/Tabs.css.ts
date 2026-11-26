import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/** Only what the design system's classes can't express: Base UI places the indicator through CSS variables. */
export const indicator = style({
  backgroundColor: uiVars['accent'],
  bottom: 0,
  height: `calc(${uiVars['border.hairline']} * 2)`,
  left: 'var(--active-tab-left)',
  position: 'absolute',
  transition: `left ${uiVars['duration.short']} ease-out, width ${uiVars['duration.short']} ease-out`,
  width: 'var(--active-tab-width)',

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  }
});
