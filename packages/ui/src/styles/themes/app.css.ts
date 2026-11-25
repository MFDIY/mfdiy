import { createGlobalTheme, globalStyle, style } from '@vanilla-extract/css';

import { root as textRoot } from '../../components/Text/Text.css.js';
import { colorSchemeVars, globalVars } from '../vars.css.js';

import { darkColorSchemeTokens, fonts, globalTokens, lightColorSchemeTokens } from './app-tokens.js';

export const appTheme = style({});

globalStyle(':root', {
  backgroundColor: colorSchemeVars['color.surface.page'],
  color: colorSchemeVars['color.content.body'],
  fontFamily: fonts['family'],
  lineHeight: '1cap'
});

globalStyle('body', {
  height: '100dvh',
  overflow: 'clip'
});

globalStyle(`a${textRoot}, ${textRoot} a`, {
  fontWeight: fonts['weight-median']
});

globalStyle(`b${textRoot}, strong${textRoot}, ${textRoot} b, ${textRoot} strong`, {
  fontWeight: fonts['weight-bulky']
});

createGlobalTheme(':root', globalVars, globalTokens);

/** Touch-sized targets wherever a finger might be used (0001). */
globalStyle(':root', {
  '@media': {
    '(any-pointer: coarse)': {
      vars: {
        [globalVars['height.button.large']]: '44px',
        [globalVars['height.button.small']]: '44px',
        [globalVars['height.button.standard']]: '44px',
        [globalVars['size.canvas.handle']]: '44px'
      }
    }
  }
});

createGlobalTheme('[data-color-scheme="light"]', colorSchemeVars, lightColorSchemeTokens);

createGlobalTheme('[data-color-scheme="dark"]', colorSchemeVars, darkColorSchemeTokens);
