import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent } from 'storybook/test';

import { Button } from '../Button/Button.js';

import { Tooltip } from './Tooltip.js';

const meta = {
  title: 'Components / Tooltip',
  component: Tooltip,
  argTypes: {
    children: { control: false },
    label: { control: { type: 'text' } }
  },
  args: {
    children: <Button aria-label='Save as new' icon='content_copy' variant='quiet' />,
    label: 'Save as new'
  }
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover the button with a mouse, or focus it with the keyboard. */
export const Default = {} satisfies Story;

export const Shown = {
  tags: ['!dev'],
  play: async () => {
    await userEvent.tab();
    await expect(await screen.findByText('Save as new')).toBeVisible();
  }
} satisfies Story;
