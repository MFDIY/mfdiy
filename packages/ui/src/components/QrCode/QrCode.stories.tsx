import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '../Box/Box.js';

import { QrCode } from './QrCode.js';

const meta = {
  title: 'Components / QrCode',
  component: QrCode,
  args: {
    label: 'Opens MFDIY on a phone or tablet',
    value: 'http://192.168.1.20'
  },
  decorators: [
    Story => (
      <Box width='panel'>
        <Story />
      </Box>
    )
  ]
} satisfies Meta<typeof QrCode>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The bridge's address on a home network, as the connect page shows it. */
export const Default = {} satisfies Story;

/** A longer address (a port and a profile) makes a denser code in the same width. */
export const LongAddress = {
  args: { value: 'http://192.168.178.123:8420/k3j9x2m4p7q1' },
  tags: ['!dev']
} satisfies Story;
