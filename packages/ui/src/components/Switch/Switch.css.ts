import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/*
 * Only what the design system's classes can't express: the whole row is the switch's hit area,
 * hovering the row lights up the switch, and the knob follows Base UI's `data-*` states.
 */

export const row = style({
  position: 'relative'
});

/** Stretches the label's hit area over the whole row, so pressing anywhere on it toggles the switch. */
export const label = style({
  selectors: {
    '&::after': {
      content: '""',
      inset: 0,
      position: 'absolute'
    }
  }
});

const enabledHover = `${row}:hover &:not([data-disabled])`;

/** Off: an outline with a grey knob. Both brighten a step on hover, like a field's border. */
export const track = style({
  backgroundColor: 'transparent',
  borderColor: uiVars['line.strong'],
  borderStyle: 'solid',
  position: 'relative',
  transition: `background-color ${uiVars['duration.short']} ease-out, border-color ${uiVars['duration.short']} ease-out`,
  zIndex: 1,

  selectors: {
    [enabledHover]: {
      borderColor: uiVars['line.bright']
    },
    '&[data-checked]:not([data-disabled])': {
      backgroundColor: uiVars['pressed']
    },
    '&[data-disabled]': {
      borderColor: uiVars['line'],
      borderStyle: 'dashed'
    }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  }
});

/** On: the knob turns white and slides across; the track only takes a faint tint. */
export const thumb = style({
  backgroundColor: uiVars['line.strong'],
  transition: `background-color ${uiVars['duration.short']} ease-out, transform ${uiVars['duration.short']} ease-out`,

  selectors: {
    [enabledHover]: {
      backgroundColor: uiVars['line.bright']
    },
    '&[data-checked]': {
      backgroundColor: uiVars['accent.pressed'],
      transform: `translateX(${uiVars['spacing.4x']})`
    },
    [`${row}:hover &[data-checked]:not([data-disabled])`]: {
      backgroundColor: uiVars['accent']
    },
    '&[data-disabled]': {
      backgroundColor: uiVars['line']
    }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  }
});
