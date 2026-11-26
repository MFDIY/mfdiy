import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/** Only what the design system's classes can't express: a line under the chosen segment. Temporary, while the looks are compared. */
export const underline = style({
  selectors: {
    '&[data-checked]': {
      boxShadow: `inset 0 calc(${uiVars['border.hairline']} * -2) 0 ${uiVars['accent']}`
    }
  }
});
