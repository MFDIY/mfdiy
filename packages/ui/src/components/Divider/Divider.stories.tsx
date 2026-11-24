import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '../Box/Box.js';
import { Columns } from '../Columns/Columns.js';
import { Placeholder } from '../Placeholder/Placeholder.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import { Divider } from './Divider.js';

/**
 * ## ⚠️ Advanced Usage
 *
 * This component is for advanced usage when creating custom layouts that include dividers. The
 * `Carousel`, `Columns`, `Inline` and `Stack` layout components have built-in dividers via the
 * `dividers` boolean prop.
 */
const meta = {
  title: 'Components / Divider',
  component: Divider,
  argTypes: {
    color: {
      description: 'The divider colour.',
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: 'string'
        }
      }
    }
  }
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

/**
 * Dividers automatically orient themselves based on their parent layout. When used in a flexbox
 * container, depending on its `flex-direction`, dividers will divide the content in the main axis
 * direction.
 */
export const AutomaticOrientation = {
  decorators: [
    Story => (
      <Columns spacing='5x'>
        <Box>
          <Stack spacing='2x'>
            <Text variant='heading.4'>Horizontal</Text>
            <Placeholder height={60} />
            <Story />
            <Placeholder height={60} />
            <Story />
            <Placeholder height={60} />
          </Stack>
        </Box>
        <Box>
          <Stack height='full' spacing='2x'>
            <Text variant='heading.4'>Vertical</Text>
            <Columns height='full' spacing='2x'>
              <Placeholder height='100%' />
              <Story />
              <Placeholder height='100%' />
              <Story />
              <Placeholder height='100%' />
            </Columns>
          </Stack>
        </Box>
      </Columns>
    )
  ]
} satisfies Story;
