import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

// Never wider or taller than the screen, however little of it a phone's keyboard leaves.
const maxHeight = 'calc(100dvh - 26px)';

export const dialog = style({
  maxHeight,
  width: 'min(420px, calc(100dvw - 26px))',

  '::backdrop': {
    // Flat, like everything else (0022): darkened, never blurred.
    backgroundColor: uiVars['backdrop']
  }
});

/** Title, scrolling content and actions, together never taller than the dialog. */
export const layout = style({ maxHeight });
