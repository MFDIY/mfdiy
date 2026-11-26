import type { Preview } from '@storybook/react-vite';

import { Title, Subtitle, Description, Primary, Stories, Controls } from '@storybook/addon-docs/blocks';
import { MemoryRouter } from 'react-router';

import '../src/styles/reset.css.js';
import '../src/styles/fonts.css.js';
import '../src/styles/themes/app.css.js';

import { Box } from '../src/components/Box/Box.js';
import { PreferencesProvider } from '../src/contexts/PreferencesProvider/PreferencesProvider.js';

import * as styles from './preview.css.js';

export default {
  tags: ['autodocs', 'visual'],
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
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    Story => (
      <Box backgroundColor='surface' className={styles.storyBackground} containerType='inline-size' padding='6x'>
        <PreferencesProvider>
          <Story />
        </PreferencesProvider>
      </Box>
    )
  ]
} satisfies Preview;
