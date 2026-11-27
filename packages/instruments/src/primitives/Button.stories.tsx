import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fireEvent, fn, within } from 'storybook/test';

import { Button, buttonStatuses } from './Button.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Button',
  component: Button,
  decorators: [mfdFrame],
  argTypes: {
    current: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    onPress: { control: false },
    status: { control: 'select', options: buttonStatuses }
  },
  args: {
    current: false,
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

/** A page button for the page shown (0018). */
export const Current = { args: { current: true, label: 'Flight' } } satisfies Story;

/** Fires the instant it's touched, not on release, as page buttons do too (0010). */
export const FiresOnTouch = {
  tags: ['!dev', '!visual'],
  play: async ({ args, canvasElement }) => {
    await fireEvent.pointerDown(within(canvasElement).getByRole('button'), { button: 0 });
    await expect(args.onPress).toHaveBeenCalledOnce();
  }
} satisfies Story;
