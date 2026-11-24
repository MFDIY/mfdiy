import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '../components/Box/Box.js';

const meta = {
  title: 'Docs / Radius Scale',
  component: Box
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => (
    <Box borderRadius='8x' borderStyle='solid' borderWidth='divider' padding='7x'>
      <Box borderRadius='7x' borderStyle='solid' borderWidth='divider' padding='6x'>
        <Box borderRadius='6x' borderStyle='solid' borderWidth='divider' padding='5x'>
          <Box borderRadius='5x' borderStyle='solid' borderWidth='divider' padding='4x'>
            <Box borderRadius='4x' borderStyle='solid' borderWidth='divider' padding='3x'>
              <Box borderRadius='3x' borderStyle='solid' borderWidth='divider' padding='2x'>
                <Box borderRadius='2x' borderStyle='solid' borderWidth='divider' padding='1x'>
                  <Box borderRadius='1x' borderStyle='solid' borderWidth='divider' padding='4x' />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
} satisfies Story;
