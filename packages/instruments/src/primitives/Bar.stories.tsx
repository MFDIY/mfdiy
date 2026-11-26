import type { Meta, StoryObj } from '@storybook/react-vite';

import { Bar, barStates } from './Bar.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Bar',
  component: Bar,
  decorators: [mfdFrame],
  argTypes: {
    displayValue: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    state: { control: 'select', options: barStates },
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } }
  },
  args: {
    displayValue: '—',
    label: 'Bar',
    state: 'normal',
    value: null
  }
} satisfies Meta<typeof Bar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A linear gauge with no value yet. */
export const Default = {} satisfies Story;

export const Filled = { args: { displayValue: '72%', label: 'Shield front', value: 0.72 } } satisfies Story;

export const Warning = {
  args: { displayValue: '18%', label: 'Quantum fuel', state: 'warning', value: 0.18 }
} satisfies Story;

export const Critical = { args: { displayValue: '6%', label: 'Hull', state: 'critical', value: 0.06 } } satisfies Story;
