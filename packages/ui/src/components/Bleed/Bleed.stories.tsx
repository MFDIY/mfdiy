import type { Meta, StoryObj } from '@storybook/react-vite';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';
import { containerSizeConditionalProperties } from '../../styles/sprinkles.css.js';
import { Box } from '../Box/Box.js';
import { Columns } from '../Columns/Columns.js';
import { Placeholder } from '../Placeholder/Placeholder.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import { Bleed, spacing, tagNames } from './Bleed.js';

const BLEED = '8x' as const;

const HORIZONTAL_DECORATOR = (Story: typeof Bleed) => (
  <Box marginInline={BLEED} outlineStyle='solid'>
    <Stack spacing='5x'>
      <Placeholder height={60} />
      <Story />
      <Placeholder height={60} />
    </Stack>
  </Box>
);

const HORIZONTAL_CHILDREN = (
  <Box>
    <Placeholder height='60px' />
  </Box>
);

const VERTICAL_DECORATOR = (Story: typeof Bleed) => (
  <Box marginBlock={BLEED} outlineStyle='solid'>
    <Columns spacing='5x'>
      <Placeholder height={100} width='33.333%' />
      <Box display='flex' flexGrow='1'>
        <Story />
      </Box>
      <Placeholder height={100} width='33.333%' />
    </Columns>
  </Box>
);

const VERTICAL_CHILDREN = (
  <Box height='full'>
    <Placeholder />
  </Box>
);

const meta = {
  title: 'Layout / Bleed',
  component: Bleed,
  argTypes: {
    bottom: createArgTypeFromConditionalStyleProp(Object.keys(spacing), containerSizeConditionalProperties.conditions),
    children: {
      description: 'The rendered contents.',
      control: false,
      table: {
        type: {
          summary: 'ReactNode'
        }
      }
    },
    horizontal: createArgTypeFromConditionalStyleProp(
      Object.keys(spacing),
      containerSizeConditionalProperties.conditions
    ),
    left: createArgTypeFromConditionalStyleProp(Object.keys(spacing), containerSizeConditionalProperties.conditions),
    right: createArgTypeFromConditionalStyleProp(Object.keys(spacing), containerSizeConditionalProperties.conditions),
    tagName: {
      description: 'The semantic HTML element used to represent this `Bleed` component.',
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
    top: createArgTypeFromConditionalStyleProp(Object.keys(spacing), containerSizeConditionalProperties.conditions),
    uniform: createArgTypeFromConditionalStyleProp(Object.keys(spacing), containerSizeConditionalProperties.conditions),
    vertical: createArgTypeFromConditionalStyleProp(Object.keys(spacing), containerSizeConditionalProperties.conditions)
  },
  args: {
    children: HORIZONTAL_CHILDREN
  }
} satisfies Meta<typeof Bleed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

/**
 * You can make content bleed horizontally by passing a spacing value to the `horizontal` prop.
 */
export const Horizontal = {
  argTypes: {
    bottom: { table: { disable: true } },
    top: { table: { disable: true } },
    uniform: { table: { disable: true } },
    vertical: { table: { disable: true } }
  },
  decorators: [HORIZONTAL_DECORATOR],
  args: {
    children: HORIZONTAL_CHILDREN,
    horizontal: BLEED
  }
} satisfies Story;

/**
 * You can make content bleed vertically by passing a spacing value to the `vertical` prop.
 */
export const Vertical = {
  argTypes: {
    horizontal: { table: { disable: true } },
    left: { table: { disable: true } },
    right: { table: { disable: true } },
    uniform: { table: { disable: true } }
  },
  decorators: [VERTICAL_DECORATOR],
  args: {
    children: VERTICAL_CHILDREN,
    vertical: BLEED
  }
} satisfies Story;

/**
 * You can make content bleed in a specific direction by passing a spacing value to the `top`,
 * `bottom`, `left` or `right` props.
 */
export const Directions = {
  argTypes: {
    bottom: { table: { disable: true } },
    horizontal: { table: { disable: true } },
    left: { table: { disable: true } },
    right: { table: { disable: true } },
    top: { table: { disable: true } },
    uniform: { table: { disable: true } },
    vertical: { table: { disable: true } }
  },
  render: () => (
    <Stack spacing='5x'>
      <Columns spacing='5x'>
        <Box marginTop='5x' outlineStyle='solid' width='full'>
          <Columns spacing='3x'>
            <Placeholder height={100} width='33.333%' />
            <Box display='flex' flexGrow='1' style={{ flexBasis: '33.333%' }}>
              <Bleed top='5x'>
                <Box position='relative'>
                  <Placeholder height='121px' />
                  <Box alignItems='center' display='flex' inset='none' justifyContent='center' position='absolute'>
                    <Text>
                      <code>top</code>
                    </Text>
                  </Box>
                </Box>
              </Bleed>
            </Box>
            <Placeholder height={100} width='33.333%' />
          </Columns>
        </Box>
        <Box marginBottom='5x' outlineStyle='solid' width='full'>
          <Columns spacing='3x'>
            <Placeholder height={100} width='33.333%' />
            <Box display='flex' flexGrow='1' style={{ flexBasis: '33.333%' }}>
              <Bleed bottom='5x'>
                <Box position='relative'>
                  <Placeholder height='121px' />
                  <Box alignItems='center' display='flex' inset='none' justifyContent='center' position='absolute'>
                    <Text>
                      <code>bottom</code>
                    </Text>
                  </Box>
                </Box>
              </Bleed>
            </Box>
            <Placeholder height={100} width='33.333%' />
          </Columns>
        </Box>
      </Columns>
      <Columns spacing='5x'>
        <Box marginLeft='5x' outlineStyle='solid' width='full'>
          <Stack spacing='3x'>
            <Placeholder height={30} />
            <Bleed left='5x'>
              <Box position='relative'>
                <Placeholder height='30px' />
                <Box alignItems='center' display='flex' inset='none' justifyContent='center' position='absolute'>
                  <Text>
                    <code>left</code>
                  </Text>
                </Box>
              </Box>
            </Bleed>
            <Placeholder height={30} />
          </Stack>
        </Box>
        <Box marginRight='5x' outlineStyle='solid' width='full'>
          <Stack spacing='3x'>
            <Placeholder height={30} />
            <Bleed right='5x'>
              <Box position='relative'>
                <Placeholder height='30px' />
                <Box alignItems='center' display='flex' inset='none' justifyContent='center' position='absolute'>
                  <Text>
                    <code>right</code>
                  </Text>
                </Box>
              </Box>
            </Bleed>
            <Placeholder height={30} />
          </Stack>
        </Box>
      </Columns>
    </Stack>
  )
} satisfies Story;
