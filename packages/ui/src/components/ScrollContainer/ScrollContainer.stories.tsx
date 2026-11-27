import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import { ScrollContainer } from './ScrollContainer.js';

const meta = {
  title: 'Components / ScrollContainer',
  component: ScrollContainer,
  argTypes: {
    children: { control: false },
    scrollRef: { control: false }
  },
  args: {
    children: (
      <Box padding='4x'>
        <Stack spacing='4x'>
          {Array.from({ length: 20 }, (_, index) => (
            <Text key={index} variant='body'>
              Line {index + 1}
            </Text>
          ))}
        </Stack>
      </Box>
    ),
    hideEdges: false,
    onOverflowBottom: fn(),
    onOverflowTop: fn(),
    scrollRef: undefined,
    viewTransitionName: undefined
  },
  decorators: [
    Story => (
      <Box borderColor='line' borderStyle='solid' borderWidth='hairline' display='flex' flexDirection='column'>
        <div style={{ display: 'flex', flexDirection: 'column', height: '240px', width: '280px' }}>
          <Story />
        </div>
      </Box>
    )
  ]
} satisfies Meta<typeof ScrollContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Scrolls its content, with a hairline at an edge while there's more beyond it. */
export const Default = {} satisfies Story;
