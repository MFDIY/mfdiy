import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

import { root } from './ScrollContainer.css.js';

/**
 * A hairline where content continues out of view: flat, never a shadow (0022). A top `Sticky`
 * takes the place of the container's top hairline, so there's never two.
 */
export const edge = style({
  backgroundColor: uiVars['line.strong'],
  height: uiVars['border.hairline'],

  selectors: {
    [`${root}:has([data-sticky="top"]) > &[data-scroll-edge="top"]`]: { display: 'none' }
  }
});
