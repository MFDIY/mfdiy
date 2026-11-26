import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, within } from 'storybook/test';

import { TextField } from './TextField.js';

const meta = {
  title: 'Components / TextField',
  component: TextField,
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    placeholder: { control: { type: 'text' } },
    value: { control: { type: 'text' } }
  },
  args: { label: 'Name', onChange: () => undefined, value: 'Fighter' },
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled = {} satisfies Story;

export const Empty = { args: { placeholder: 'Untitled profile', value: '' } } satisfies Story;

/** The border brightens while the field has focus. */
export const Focused = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');

    input.focus();
    await expect(input).toHaveFocus();
  }
} satisfies Story;

export const WithError = { args: { error: 'A profile with this name already exists.' } } satisfies Story;

export const Disabled = { args: { disabled: true } } satisfies Story;
