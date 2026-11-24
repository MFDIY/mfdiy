import type { colorSchemeVars, globalVars } from '../src/styles/design-system.js';
import type { Preview } from '@storybook/react-vite';
import type { createGlobalTheme } from '@vanilla-extract/css';

import { Title, Subtitle, Description, Primary, Stories, Controls } from '@storybook/addon-docs/blocks';
import { DecoratorHelpers } from '@storybook/addon-themes';
import { MemoryRouter } from 'react-router';

import { Box } from '../src/components/Box/Box.js';
import { PreferencesProvider } from '../src/contexts/PreferencesProvider/PreferencesProvider.js';
import { designSystem } from '../src/styles/design-system.js';
import {
  darkColorSchemeTokens as appDarkColorSchemeTokens,
  globalTokens as appGlobalTokens,
  lightColorSchemeTokens as appLightColorSchemeTokens
} from '../src/styles/themes/app-tokens.js';

import * as styles from './preview.css.js';

type GlobalTokens = Parameters<typeof createGlobalTheme<typeof globalVars>>[2];

type ColorSchemeTokens = Parameters<typeof createGlobalTheme<typeof colorSchemeVars>>[2];

type Theme = {
  themeSelector: string;
  globalTokens: GlobalTokens;
  colorSchemeTokens: {
    light: ColorSchemeTokens;
    dark: ColorSchemeTokens;
  };
};

const { initializeThemeState, pluckThemeFromContext } = DecoratorHelpers;

const THEMES = {
  App: {
    themeSelector: styles.themeSelectors['App'],
    globalTokens: appGlobalTokens,
    colorSchemeTokens: {
      light: appLightColorSchemeTokens,
      dark: appDarkColorSchemeTokens
    }
  }
} as const satisfies Record<string, Theme>;

const DEFAULT_THEME = 'App' as const satisfies keyof typeof THEMES;

initializeThemeState(Object.keys(THEMES), DEFAULT_THEME);

export default {
  tags: ['autodocs'],
  globalTypes: {
    colorScheme: {
      description: 'Color scheme',
      toolbar: {
        title: 'Color scheme',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    colorScheme: 'light'
  },
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Docs', 'Layout', 'Components']
      }
    },
    layout: 'fullscreen',
    docs: {
      canvas: {
        layout: 'fullscreen',
        withToolbar: false,
        previewSource: 'open'
      },
      toc: {
        ignoreSelector: '.sb-story *',
        headingSelector: 'h2, h3, h4'
      },
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <h2 id='props'>Props</h2>
          <Primary />
          <Controls sort='alpha' />
          <h2 id='details'>Details</h2>
          <Stories includePrimary={false} title='' />
        </>
      )
    },
    controls: {
      expanded: true
    },
    viewport: {
      /**
       * Support every container size while accounting for the padding added to each story via
       * decorators. The range supported by Storybook is [200, 2560] so we can't include our 100px
       * container size.
       */
      options: {
        '200px': { name: 'Container Width 200px', styles: { width: '232px', height: '1080px' } },
        '300px': { name: 'Container Width 300px', styles: { width: '332px', height: '1080px' } },
        '400px': { name: 'Container Width 400px', styles: { width: '432px', height: '1080px' } },
        '500px': { name: 'Container Width 500px', styles: { width: '532px', height: '1080px' } },
        '600px': { name: 'Container Width 600px', styles: { width: '632px', height: '1080px' } },
        '700px': { name: 'Container Width 700px', styles: { width: '732px', height: '1080px' } },
        '800px': { name: 'Container Width 800px', styles: { width: '832px', height: '1080px' } },
        '900px': { name: 'Container Width 900px', styles: { width: '932px', height: '1080px' } },
        '1000px': { name: 'Container Width 1000px', styles: { width: '1032px', height: '1080px' } }
      }
    }
  },
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    (Story, context) => {
      const colorScheme = (context.globals['colorScheme'] ?? 'light') as string;
      document.documentElement.setAttribute('data-color-scheme', colorScheme);
      document.documentElement.classList.add(
        ...designSystem({ backgroundColor: 'page', containerType: 'inline-size' }).split(' ')
      );

      return (
        <Box backgroundColor='page' className={styles.storyBackground} containerType='inline-size' padding='6x'>
          <PreferencesProvider>
            <Story />
          </PreferencesProvider>
        </Box>
      );
    },
    (Story, context) => {
      const selectedTheme = pluckThemeFromContext(context) as keyof typeof THEMES;
      const activeTheme = selectedTheme || DEFAULT_THEME;

      return (
        <Box
          className={THEMES[activeTheme].themeSelector}
          data-attribute-theme={activeTheme}
          id='story-decorator-theme'
        >
          {Story(context)}
        </Box>
      );
    }
  ]
} satisfies Preview;
