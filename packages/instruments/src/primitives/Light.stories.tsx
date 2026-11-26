import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { buttonStatuses } from './Button.js';
import { Light, lightStates } from './Light.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Light',
  component: Light,
  decorators: [mfdFrame],
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    onPress: { control: false },
    state: { control: 'select', options: lightStates },
    status: { control: 'select', options: [undefined, ...buttonStatuses] }
  },
  args: {
    disabled: false,
    label: 'Light',
    onPress: undefined,
    state: 'off',
    status: undefined
  }
} satisfies Meta<typeof Light>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An annunciator light, off. */
export const Default = {} satisfies Story;

export const On = { args: { label: 'Gear', state: 'on' } } satisfies Story;

export const Warning = { args: { label: 'QT low', state: 'warning' } } satisfies Story;

export const Critical = { args: { label: 'Hull', state: 'critical' } } satisfies Story;

/** Pressable, like a lit push-button in a cockpit. */
export const Pressable = { args: { label: 'Gear', onPress: fn(), state: 'on' } } satisfies Story;
