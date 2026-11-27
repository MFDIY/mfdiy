import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/** The colour the logomark takes, set by `Logomark`'s `color`. */
export const colorProperty = '--logomark-color';

/** Wide, bold and tracked, with a faint glow in its own colour, as in the chrome's design (0022). */
export const root = style({
  color: `var(${colorProperty}, ${uiVars['accent']})`,
  fontSize: uiVars['font.size.heading'],
  fontStretch: '112.5%',
  fontWeight: uiVars['font.weight.bold'],
  letterSpacing: '0.2em',
  lineHeight: 1,
  marginInlineEnd: '-0.2em',
  textShadow: '0 0 10px color-mix(in srgb, currentColor 33%, transparent)',
  transitionDuration: uiVars['duration.long'],
  transitionProperty: 'color',
  transitionTimingFunction: 'ease-out',
  whiteSpace: 'nowrap',

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transitionDuration: '0s'
    }
  }
});
