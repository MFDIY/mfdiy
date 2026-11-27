import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/**
 * A control-sized hit area around the small icon, without the room: it reaches past the button on
 * every side, above whatever stretches its own hit area over the row (Switch's label).
 */
export const trigger = style({
  position: 'relative',
  zIndex: 1,

  selectors: {
    '&::after': {
      content: '""',
      inset: `calc((${uiVars['size.control']} - 100%) / -2)`,
      position: 'absolute'
    }
  }
});

/** Above sheets and their backdrops, which open in later layers. */
export const positioner = style({
  zIndex: 10
});
