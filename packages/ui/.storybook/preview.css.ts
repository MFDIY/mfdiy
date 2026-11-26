import { style } from '@vanilla-extract/css';

import { uiVars } from '../src/styles/vars.css.js';

/** A faint dot grid behind stories, so a component's own edges stay visible. */
export const storyBackground = style({
  backgroundImage: `radial-gradient(${uiVars['line']} 1px, transparent 0)`,
  backgroundPosition: '-5px -5px',
  backgroundSize: '8px 8px'
});
