import { createGlobalTheme, globalFontFace, globalStyle, style, styleVariants } from '@vanilla-extract/css';

import '../src/styles/reset.css.js';

import { root as textRoot } from '../src/components/Text/Text.css.js';
import {
  darkColorSchemeTokens as appDarkColorSchemeTokens,
  fonts,
  globalTokens as appGlobalTokens,
  lightColorSchemeTokens as appLightColorSchemeTokens
} from '../src/styles/themes/app-tokens.js';
import { colorSchemeVars, globalVars } from '../src/styles/vars.css.js';

export const storyBackground = style({
  backgroundImage: 'radial-gradient(#bbb4 1px, transparent 0)',
  backgroundPosition: '-5px -5px',
  backgroundSize: '8px 8px'
});

const defaultFontOptions = {
  fontDisplay: 'swap',
  fontWeight: '100 900'
} as const satisfies Omit<Parameters<typeof globalFontFace>[1], 'src'>;

globalFontFace('IBM Plex Sans', [
  {
    ...defaultFontOptions,
    fontStyle: 'normal',
    src: `url('../src/fonts/IBMPlexSans.woff2') format('woff2 supports variations'), url('../src/fonts/IBMPlexSans.woff2') format('woff2-variations')`
  },
  {
    ...defaultFontOptions,
    fontStyle: 'italic',
    src: `url('../src/fonts/IBMPlexSans-Italic.woff2') format('woff2 supports variations'), url('../src/fonts/IBMPlexSans-Italic.woff2') format('woff2-variations')`
  }
]);

export const themeSelectors = styleVariants({
  App: {}
});

/** App */
createGlobalTheme(themeSelectors['App'], globalVars, appGlobalTokens);
createGlobalTheme(':root[data-color-scheme="light"]', colorSchemeVars, appLightColorSchemeTokens);
createGlobalTheme(':root[data-color-scheme="dark"]', colorSchemeVars, appDarkColorSchemeTokens);

globalStyle(themeSelectors['App'], {
  backgroundColor: colorSchemeVars['color.surface.page'],
  color: colorSchemeVars['color.content.body'],
  fontFamily: fonts['family'],
  lineHeight: '1cap'
});

globalStyle(
  [
    `${themeSelectors['App']} b${textRoot}`,
    `${themeSelectors['App']} strong${textRoot}`,
    `${themeSelectors['App']} ${textRoot} b`,
    `${themeSelectors['App']} ${textRoot} strong`
  ].join(', '),
  {
    fontWeight: fonts['weight-bulky']
  }
);
