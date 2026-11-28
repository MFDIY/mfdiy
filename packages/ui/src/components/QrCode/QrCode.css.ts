import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/**
 * Dark squares on the chrome's lightest colour, the way round every scanner reads; its own quiet
 * zone is drawn inside. It fills the width it's given and stays square.
 */
export const root = style({
  aspectRatio: '1',
  backgroundColor: uiVars['text'],
  color: uiVars['surface'],
  display: 'block',
  shapeRendering: 'crispEdges',
  width: '100%'
});
