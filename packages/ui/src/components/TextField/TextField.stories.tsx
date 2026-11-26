import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { TextField } from './TextField.js';

/** TextField is controlled; in a story, something has to hold what's typed, like a page would. */
function EditableTextField({ value: initialValue, onChange, ...restProps }: ComponentProps<typeof TextField>) {
  const [value, setValue] = useState(initialValue);

  return (
    <TextField
      {...restProps}
      onChange={next => {
        setValue(next);
        onChange(next);
      }}
      value={value}
    />
  );
}

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
  // Keyed on the control, so changing `value` in the controls panel starts the field over.
  render: args => <EditableTextField {...args} key={args.value} />,
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

/** What's typed shows up: the story feeds it back into the controlled value. */
export const Typing = {
  tags: ['!dev'],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.type(input, 'Hornet');
    await expect(input).toHaveValue('Hornet');
  }
} satisfies Story;
