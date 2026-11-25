import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '../Box/Box.js';
import { Text } from '../Text/Text.js';

import { Popover } from './Popover.js';

const meta = {
  title: 'Components / Popover',
  component: Popover,
  args: {
    title: 'Add a widget',
    onClose: () => undefined,
    position: { x: 80, y: 80 },
    children: <Text variant='body'>A sheet at the bottom in a narrow container.</Text>
  },
  decorators: [
    Story => (
      <Box containerType='inline-size'>
        <Story />
      </Box>
    )
  ]
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
