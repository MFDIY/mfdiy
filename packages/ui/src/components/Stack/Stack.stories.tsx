import type { Meta, StoryObj } from '@storybook/react-vite';

import { stylePropArgTypes } from '../../../.storybook/stylePropArgTypes.js';
import { Placeholder } from '../Placeholder/Placeholder.js';

import { Stack, order, supportedStyleProps, tagNames } from './Stack.js';

const columnsStylePropArgTypes = {
  ...Object.fromEntries(
    Object.entries(stylePropArgTypes).filter(([property]) =>
      supportedStyleProps.includes(property as (typeof supportedStyleProps)[number])
    )
  ),

  /* Map our "renamed" style props. */
  spacing: stylePropArgTypes['rowGap']
};

const meta = {
  title: 'Layout / Stack',
  component: Stack,
  argTypes: {
    children: {
      description: 'The rendered contents, where each child becomes a row.',
      control: false,
      table: {
        type: {
          summary: 'ReactNode'
        }
      }
    },
    dividers: {
      description: 'Adds dividers between all rows. These dividers are affected by `spacing`.',
      control: {
        type: 'boolean'
      },
      table: {
        type: {
          summary: 'boolean'
        }
      }
    },
    order: {
      description: 'Controls the order of the rows.',
      control: {
        type: 'select'
      },
      options: [undefined, ...order],
      table: {
        defaultValue: { summary: "'normal'" },
        type: {
          summary: order.map(o => `'${o}'`).join(' | ')
        }
      }
    },
    tagName: {
      description: 'The semantic HTML element used to represent this `Stack` component.',
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
    ...columnsStylePropArgTypes
  },
  args: {
    dividers: false
  }
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: function Render(args) {
    return (
      <Stack {...args}>
        <Placeholder height={180} />
        <Placeholder height={120} />
        <Placeholder height={60} />
      </Stack>
    );
  }
} satisfies Story;

/**
 * When using items that don't fill the full width of a row, you can horizontally align the items
 * using `alignItems`.
 */
export const WithAlignItems = {
  args: {
    alignItems: 'center'
  },
  render: function Render(args) {
    return (
      <Stack {...args}>
        <Placeholder width={200} />
        <Placeholder width={150} />
        <Placeholder width={100} />
      </Stack>
    );
  }
} satisfies Story;

/**
 * You can automatically add dividers by passing the `dividers` boolean prop.
 */
export const WithDividers = {
  args: {
    dividers: true,
    spacing: '2x'
  },
  render: function Render(args) {
    return (
      <Stack {...args}>
        <Placeholder height={60} />
        <Placeholder height={60} />
        <Placeholder height={60} />
      </Stack>
    );
  }
} satisfies Story;
