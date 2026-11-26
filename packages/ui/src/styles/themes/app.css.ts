import { createGlobalTheme, globalStyle } from '@vanilla-extract/css';

import { uiVars } from '../vars.css.js';

import { chromeTokens, coarsePointerTokens } from './chrome.js';

/** The `mfdiy` theme on the whole page. Dark only; there are no colour schemes (0022). */
createGlobalTheme(':root', uiVars, chromeTokens);

globalStyle(':root', {
  backgroundColor: uiVars['surface'],
  color: uiVars['text'],
  colorScheme: 'dark',
  fontFamily: uiVars['font'],
  fontSize: uiVars['font.size.body'],
  fontStretch: uiVars['font.stretch'],
  // Martian Mono's coding ligatures don't belong in interface text.
  fontVariantLigatures: 'none',
  lineHeight: '1cap',

  '@media': {
    '(any-pointer: coarse)': {
      vars: Object.fromEntries(
        Object.entries(coarsePointerTokens).map(([name, value]) => [
          uiVars[name as keyof typeof coarsePointerTokens],
          value
        ])
      )
    }
  }
});

globalStyle('body', {
  height: '100dvh',
  overflow: 'clip'
});
