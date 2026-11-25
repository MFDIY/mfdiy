import { createVar, style } from '@vanilla-extract/css';

import { POPOVER_HEIGHT, POPOVER_MARGIN, POPOVER_WIDTH } from './geometry.js';

export const x = createVar();
export const y = createVar();

const margin = `${POPOVER_MARGIN}px`;

export const popover = style({
  // A bottom sheet, where the interface is too narrow for anything else.
  bottom: 0,
  height: 'min(420px, 60dvh)',
  left: 0,
  margin: 0,
  maxHeight: 'none',
  maxWidth: 'none',
  position: 'fixed',
  right: 0,
  top: 'auto',
  width: '100%',

  '::backdrop': {
    // What's being worked on stays visible.
    backgroundColor: 'transparent'
  },

  '@container': {
    '(inline-size >= 600px)': {
      bottom: 'auto',
      height: `min(${POPOVER_HEIGHT}px, calc(100dvh - 2 * ${margin}))`,
      // Never off the screen, even if it was resized since.
      left: `clamp(${margin}, ${x}, calc(100dvw - ${POPOVER_WIDTH}px - ${margin}))`,
      right: 'auto',
      top: `clamp(${margin}, ${y}, max(${margin}, calc(100dvh - ${POPOVER_HEIGHT}px - ${margin})))`,
      width: `${POPOVER_WIDTH}px`
    }
  }
});
