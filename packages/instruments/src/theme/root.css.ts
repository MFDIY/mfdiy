import { style } from '@vanilla-extract/css';

import { vars } from './contract.css.js';
import { phosphor } from './themes.js';
import { fontFamily, token } from './token.js';

/** Applied to the element that hosts an MFD. Sets base defaults; everything else cascades from here. */
export const root = style({
  vars: Object.fromEntries(
    Object.entries(phosphor).map(([name, value]) => [vars[name as keyof typeof phosphor], value])
  ),
  backgroundColor: token('surface'),
  color: token('text'),
  fontFamily: fontFamily('font.text'),
  // Isolate the MFD from the host page's typography (the builder UI uses `line-height: 1cap`).
  lineHeight: 1.2
});
