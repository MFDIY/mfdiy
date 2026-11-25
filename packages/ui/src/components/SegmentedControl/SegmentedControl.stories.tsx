import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { SegmentedControl } from './SegmentedControl.js';

const meta = {
  title: 'Components / SegmentedControl',
  component: SegmentedControl,
  args: {
    options: [
      { label: 'History', value: 'history' },
      { label: 'Invoice', value: 'invoice' }
    ],
    value: 'history',
    onChange: () => {}
  }
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <SegmentedControl {...args} onChange={setValue} value={value} />;
  }
} satisfies Story;
