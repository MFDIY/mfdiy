import { createVar, fallbackVar, style } from '@vanilla-extract/css';

import { uiVars } from './vars.css.js';

/**
 * The colour of the surface content sits on, set by whatever paints one (a sheet, a sidebar), so a
 * part that sticks while content scrolls under it can cover that content in the same colour,
 * through any wrappers in between.
 */
const currentSurface = createVar();

export const onSurface = style({ vars: { [currentSurface]: uiVars['surface'] } });

export const onRaisedSurface = style({ vars: { [currentSurface]: uiVars['surface.raised'] } });

export const surfaceBackground = style({ backgroundColor: fallbackVar(currentSurface, uiVars['surface']) });
