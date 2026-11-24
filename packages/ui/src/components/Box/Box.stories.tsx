import type { Meta, StoryObj } from '@storybook/react-vite';

import { stylePropArgTypes } from '../../../.storybook/stylePropArgTypes.js';
import { Placeholder } from '../Placeholder/Placeholder.js';

import { Box, excludedIntrinsicProps, tagNames } from './Box.js';

const excludedArgTypes = new Set<string>([
  ...excludedIntrinsicProps.filter(excludedIntrinsicProp => !['height', 'width'].includes(excludedIntrinsicProp))
]);

const boxStylePropArgTypes = Object.fromEntries(
  Object.entries(stylePropArgTypes).filter(([property]) => !excludedArgTypes.has(property))
);

const meta = {
  title: 'Layout / Box',
  component: Box,
  argTypes: {
    children: {
      description: 'The rendered contents.',
      control: false,
      table: {
        type: {
          summary: 'ReactNode'
        }
      }
    },
    className: {
      description: '**⚠️ Escape hatch! Avoid using this.**\n\nSets a custom CSS class.',
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: 'string'
        }
      }
    },
    cssVariables: {
      description:
        'Sets inline CSS Variables that are scoped to this `Box`. Useful to pass information down to nested components.',
      control: {
        type: 'object'
      },
      table: {
        type: {
          summary: 'Record<`--${string}`, number | string>'
        }
      }
    },
    htmlHeight: {
      description:
        "**⚠️ Escape hatch! Avoid using this.**\n\nSets a native `height` attribute. Useful when using `'img'` or `'svg'` as the `tagName` value.",
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: 'number | string'
        }
      }
    },
    htmlWidth: {
      description:
        "**⚠️ Escape hatch! Avoid using this.**\n\nSets a native `width` attribute. Useful when using `'img'` or `'svg'` as the `tagName` value.",
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: 'number | string'
        }
      }
    },
    tagName: {
      description: 'The semantic HTML element used to represent this `Box` component.',
      control: {
        type: 'select'
      },
      options: [undefined, ...tagNames],
      table: {
        defaultValue: { summary: "'div'" },
        type: {
          summary: tagNames.map(tagName => `'${tagName}'`).join(' | ')
        }
      }
    },
    ...boxStylePropArgTypes
  },
  args: {
    children: <Placeholder height={60} />
  }
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
