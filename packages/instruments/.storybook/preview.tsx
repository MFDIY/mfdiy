import type { Preview } from '@storybook/react-vite';

import '@mfdiy/ui';

import { builtInThemes } from '../src/theme/themes.js';

/** Theme playground: switch between built-in themes from the toolbar. */
export default {
  tags: ['autodocs', 'visual'],
  globalTypes: {
    theme: {
      description: 'MFD theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: builtInThemes.map(theme => ({ value: theme.name, title: theme.name })),
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    theme: builtInThemes[0]?.name
  },
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Preview;
