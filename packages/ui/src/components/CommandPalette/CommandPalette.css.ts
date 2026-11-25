import { style } from '@vanilla-extract/css';

import { colorSchemeVars, globalVars } from '../../styles/vars.css.js';

import { TRANSITION_DURATION } from './config.js';

const hasRoom = '(inline-size >= 500px) and (block-size >= 380px)';

export const transitionDuration = style({ transitionDuration: `${TRANSITION_DURATION}ms` });

export const container = style({
  borderRadius: globalVars['spacing.none'],
  borderWidth: '0px',
  boxShadow: 'none',
  '@container': {
    [hasRoom]: {
      borderBottomLeftRadius: globalVars['spacing.3x'],
      borderBottomRightRadius: globalVars['spacing.3x'],
      borderTopLeftRadius: globalVars['spacing.4x'],
      borderTopRightRadius: globalVars['spacing.4x'],
      borderWidth: '1px',
      boxShadow: colorSchemeVars['color.shadow.elevation.floating'],
      height: '80dvh',
      maxHeight: 380,
      maxWidth: 500
    }
  }
});

export const closeButton = style({
  display: 'block',
  '@container': {
    [hasRoom]: {
      display: 'none'
    }
  }
});

export const preview = style({
  height: '52px',
  width: '88px'
});
