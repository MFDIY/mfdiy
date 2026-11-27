import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/** The colour the logomark takes, set by `Logomark`'s `color`. */
export const colorProperty = '--logomark-color';

/**
 * Wide, bold and tracked, with a faint glow in its own colour, as in the chrome's design (0022). Its
 * padding is part of it; the tracking after the last letter counts towards the padding at the end.
 */
export const root = style({
  color: `var(${colorProperty}, ${uiVars['accent']})`,
  fontSize: uiVars['font.size.heading'],
  fontStretch: '112.5%',
  fontWeight: uiVars['font.weight.bold'],
  letterSpacing: '0.2em',
  lineHeight: 1,
  paddingInlineEnd: `calc(${uiVars['spacing.4x']} - 0.2em)`,
  paddingInlineStart: uiVars['spacing.4x'],
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
