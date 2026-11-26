import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/** A hairline where content continues out of view: flat, never a shadow (0022). */
export const edge = style({
  backgroundColor: uiVars['line.strong'],
  height: uiVars['border.hairline']
});
