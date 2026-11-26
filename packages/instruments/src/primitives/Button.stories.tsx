import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { Button, buttonStatuses } from './Button.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Button',
  component: Button,
  decorators: [mfdFrame],
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    onPress: { control: false },
    status: { control: 'select', options: buttonStatuses }
  },
  args: {
    disabled: false,
    label: 'Button',
    onPress: fn(),
    status: 'idle'
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Triggers a game action. Fires on touch, not on release (0010). */
export const Default = {} satisfies Story;

/** The game accepted the action. */
export const Ok = { args: { label: 'Gear', status: 'ok' } } satisfies Story;

/** The game refused the action. */
export const Failed = { args: { label: 'Doors', status: 'failed' } } satisfies Story;

export const Disabled = { args: { disabled: true } } satisfies Story;
