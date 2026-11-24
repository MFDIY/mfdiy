import type { Meta, StoryObj } from '@storybook/react-vite';

import { stylePropArgTypes } from '../../../.storybook/stylePropArgTypes.js';
import { Box } from '../Box/Box.js';
import { Placeholder } from '../Placeholder/Placeholder.js';

import { Inline, order, supportedStyleProps, tagNames } from './Inline.js';

const columnsStylePropArgTypes = {
  ...Object.fromEntries(
    Object.entries(stylePropArgTypes).filter(([property]) =>
      supportedStyleProps.includes(property as (typeof supportedStyleProps)[number])
    )
  ),

  /* Map our "renamed" style props. */
  collapsedSpacing: stylePropArgTypes['rowGap'],
  spacing: stylePropArgTypes['columnGap']
};

const meta = {
  title: 'Layout / Inline',
  component: Inline,
  argTypes: {
    children: {
      description: 'The rendered contents, where each child becomes a flex item.',
      control: false,
      table: {
        type: {
          summary: 'ReactNode'
        }
      }
    },
    collapseBelow: {
      description: "Stacks the contents when this component's container becomes narrower than the given breakpoint.",
      control: {
        type: 'select'
      },
      options: [undefined, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
      table: {
        type: {
          summary: '100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000'
        }
      }
    },
    collapsedOrder: {
      description: 'Controls the order of the rows when this component is collapsed.',
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
    dividers: {
      description: 'Adds dividers between all items. These dividers are affected by `spacing` and `collapsedSpacing`.',
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
      description: 'Controls the order of the flex items.',
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
      description: 'The semantic HTML element used to represent this `Inline` component.',
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
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: function Render(args) {
    return (
      <Inline {...args}>
        <Placeholder height={180} width={180} />
        <Placeholder height={120} width={120} />
        <Placeholder height={60} width={60} />
      </Inline>
    );
  }
} satisfies Story;

/**
 * In contrast to [`Columns`](/?path=/docs/layout-columns--documentation), `Inline` wraps its items
 * when overflowing.
 */
export const WrappingBehaviour = {
  render: function Render(args) {
    return (
      <Inline {...args}>
        <Placeholder height={180} width={180} />
        <Placeholder height={120} width={120} />
        <Placeholder height={60} width={60} />
        <Placeholder height={180} width={180} />
        <Placeholder height={120} width={120} />
        <Placeholder height={60} width={60} />
        <Placeholder height={180} width={180} />
        <Placeholder height={120} width={120} />
        <Placeholder height={60} width={60} />
      </Inline>
    );
  }
} satisfies Story;

/**
 * By default, flex items are allowed to shrink but not grow. Setting each `Box` to `height='full'`
 * will constrain that flex item to its natural height, rather than filling the available space.
 */
export const DifferentItemHeights = {
  render: function Render(args) {
    return (
      <Inline {...args}>
        <Box height='full'>
          <Placeholder height={180} width={180} />
        </Box>
        <Box height='full'>
          <Placeholder height={120} width={120} />
        </Box>
        <Box height='full'>
          <Placeholder height={60} width={60} />
        </Box>
      </Inline>
    );
  }
} satisfies Story;

/**
 * When using [different flex item heights](#different%20item%20heights), you can vertically align
 * the flex items using `alignItems`.
 */
export const WithAlignItems = {
  args: {
    alignItems: 'flex-end'
  },
  render: function Render(args) {
    return (
      <Inline {...args}>
        <Box height='full'>
          <Placeholder height={180} width={180} />
        </Box>
        <Box height='full'>
          <Placeholder height={120} width={120} />
        </Box>
        <Box height='full'>
          <Placeholder height={60} width={60} />
        </Box>
      </Inline>
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
      <Inline {...args}>
        <Placeholder height={48} width={48} />
        <Placeholder height={48} width={48} />
        <Placeholder height={48} width={48} />
        <Placeholder height={48} width={48} />
        <Placeholder height={48} width={48} />
        <Placeholder height={48} width={48} />
        <Placeholder height={48} width={48} />
        <Placeholder height={48} width={48} />
      </Inline>
    );
  }
} satisfies Story;

/**
 * You can pass a container size value to the `collapseBelow` prop to make `Inline` collapse into a
 * stack of rows. You can control the spacing between columns and rows via the `spacing` and
 * `collapsedSpacing` props respectively. You can also control the order of columns and rows via the
 * `direction` and `collapsedDirection` props respectively.
 */
export const CollapsibleBehaviour = {
  args: {
    collapseBelow: 1000,
    collapsedOrder: 'reversed'
  },
  render: function Render(args) {
    return (
      <Inline {...args}>
        <Box height='full'>
          <Placeholder height={180} width={180} />
        </Box>
        <Box height='full'>
          <Placeholder height={120} width={120} />
        </Box>
        <Box height='full'>
          <Placeholder height={60} width={60} />
        </Box>
      </Inline>
    );
  }
} satisfies Story;
