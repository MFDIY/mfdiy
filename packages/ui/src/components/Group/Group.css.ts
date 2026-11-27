import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/** Keeps a gap in the frame's line around the title, while the title's text lines up with the content. */
export const legend = style({
  marginInlineStart: `calc(-1 * ${uiVars['spacing.1x']})`
});
