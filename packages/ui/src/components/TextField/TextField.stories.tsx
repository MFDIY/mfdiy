import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from './TextField.js';

const meta = {
  title: 'Components / TextField',
  component: TextField,
  args: { label: 'Name', onChange: () => undefined, value: 'Fighter' }
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
