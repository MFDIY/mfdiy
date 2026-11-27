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
    clearable: { control: { type: 'boolean' } },
    description: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    focus: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    placeholder: { control: { type: 'text' } },
    value: { control: { type: 'text' } }
  },
  args: {
    clearable: false,
    description: undefined,
    disabled: false,
    error: undefined,
    focus: false,
    label: 'Label',
    maxLength: undefined,
    onChange: () => undefined,
    placeholder: undefined,
    value: ''
  },
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

/** Every prop at its default, and empty. */
export const Default = {} satisfies Story;

export const Filled = { args: { label: 'Name', value: 'Fighter' } } satisfies Story;

export const Empty = { args: { label: 'Name', placeholder: 'Untitled profile' } } satisfies Story;

/** The border brightens while the field has focus. */
export const Focused = {
  args: { label: 'Name', value: 'Fighter' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');

    input.focus();
    await expect(input).toHaveFocus();
  }
} satisfies Story;

/** With a button that empties the field, while it has text. */
export const Clearable = { args: { clearable: true, label: 'Name', value: 'Fighter' } } satisfies Story;

export const WithError = {
  args: { error: 'A profile with this name already exists.', label: 'Name', value: 'Fighter' }
} satisfies Story;

/** Focused from code, e.g. after duplicating something, with its text selected to type over. */
export const FocusedFromCode = {
  tags: ['!dev'],
  args: { focus: true, label: 'Name', value: 'Flight (clone)' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole<HTMLInputElement>('textbox');

    await expect(input).toHaveFocus();
    await expect([input.selectionStart, input.selectionEnd]).toEqual([0, 'Flight (clone)'.length]);
  }
} satisfies Story;

export const Disabled = { args: { disabled: true, label: 'Name', value: 'Fighter' } } satisfies Story;

/** What's typed shows up: the story feeds it back into the controlled value. */
export const Typing = {
  tags: ['!dev'],
  args: { label: 'Name', value: 'Fighter' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.type(input, 'Hornet');
    await expect(input).toHaveValue('Hornet');
  }
} satisfies Story;

/** Clearing empties the field and leaves focus in it. */
export const ClearEmpties = {
  tags: ['!dev', '!visual'],
  args: { clearable: true, label: 'Name', value: 'Fighter' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Name' });

    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));

    await expect(field).toHaveValue('');
    await expect(field).toHaveFocus();
    await expect(canvas.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  }
} satisfies Story;
