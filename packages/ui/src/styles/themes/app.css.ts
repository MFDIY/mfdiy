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

createGlobalTheme('[data-color-scheme="light"]', colorSchemeVars, lightColorSchemeTokens);

createGlobalTheme('[data-color-scheme="dark"]', colorSchemeVars, darkColorSchemeTokens);
