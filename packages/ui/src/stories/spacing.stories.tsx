import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '../components/Box/Box.js';
import { Placeholder } from '../components/Placeholder/Placeholder.js';

const meta = {
  title: 'Docs / Spacing Scale',
  component: Box
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => {
    const spacings = ['1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Placeholder height='50px' />
        {spacings.map(spacing => (
          <Box key={spacing} style={{ paddingTop: `var(--spacing-${spacing})` }}>
            <Placeholder height='50px' />
          </Box>
        ))}
      </div>
    );
  }
} satisfies Story;
