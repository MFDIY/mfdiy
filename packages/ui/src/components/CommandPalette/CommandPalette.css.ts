import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

import { TRANSITION_DURATION } from './config.js';

const hasRoom = '(inline-size >= 500px) and (block-size >= 380px)';

export const transitionDuration = style({ transitionDuration: `${TRANSITION_DURATION}ms` });

export const container = style({
  borderWidth: '0px',
  '@container': {
    [hasRoom]: {
      borderWidth: uiVars['border.hairline'],
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
