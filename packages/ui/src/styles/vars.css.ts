import { createGlobalThemeContract } from '@vanilla-extract/css';

import { chromeTokens, type ChromeTokenName } from './themes/chrome.js';

/**
 * The builder interface's CSS variables: `--ui-*`, never `--mfd-*`, so a user's MFD theme can't
 * reach the interface, not even the parts drawn on top of an MFD (0022).
 */
export const uiVars = createGlobalThemeContract(
  Object.fromEntries(Object.keys(chromeTokens).map(name => [name, `ui-${name.replaceAll('.', '-')}`])) as Record<
    ChromeTokenName,
    string
  >
);
