import type { Preview } from '@storybook/react-vite';

import { builtInThemes } from '@mfdiy/instruments';

/** Editing controls must stay visible on any theme: switch between them from the toolbar. */
export default {
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
