import type { Meta, StoryObj } from '@storybook/react-vite';

import { Readout } from './Readout.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Readout',
  component: Readout,
  decorators: [mfdFrame],
  argTypes: {
    label: { control: { type: 'text' } },
    unit: { control: { type: 'text' } },
    value: { control: { type: 'text' } }
  },
  args: {
    label: 'Readout',
    unit: undefined,
    value: '—'
  }
} satisfies Meta<typeof Readout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A value as text, with no value yet. */
export const Default = {} satisfies Story;

export const WithUnit = { args: { label: 'SCM speed', unit: 'm/s', value: '212' } } satisfies Story;
