import type { Meta, StoryObj } from '@storybook/react-vite';

import { Light, lightStates } from './Light.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Light',
  component: Light,
  decorators: [mfdFrame],
  argTypes: {
    label: { control: { type: 'text' } },
    state: { control: 'select', options: lightStates }
  },
  args: {
    label: 'Light',
    state: 'off'
  }
} satisfies Meta<typeof Light>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An annunciator light, off. */
export const Default = {} satisfies Story;

export const On = { args: { label: 'Gear', state: 'on' } } satisfies Story;

export const Warning = { args: { label: 'QT low', state: 'warning' } } satisfies Story;

export const Critical = { args: { label: 'Hull', state: 'critical' } } satisfies Story;
