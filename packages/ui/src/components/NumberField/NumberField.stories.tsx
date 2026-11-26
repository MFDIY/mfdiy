import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps } from 'react';
import { expect, screen, userEvent } from 'storybook/test';

import { NumberField } from './NumberField.js';

/** NumberField is controlled; in a story, something has to hold the value, like a page would. */
function EditableNumberField({ onChange, value: initialValue, ...restProps }: ComponentProps<typeof NumberField>) {
  const [value, setValue] = useState(initialValue);

  return (
    <NumberField
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
  title: 'Components / NumberField',
  component: NumberField,
  argTypes: {
    description: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    max: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
    unit: { control: { type: 'text' } },
    value: { control: { type: 'number' } }
  },
  args: {
    description: undefined,
    disabled: false,
    error: undefined,
    label: 'Label',
    max: undefined,
    min: undefined,
    onChange: () => undefined,
    step: undefined,
    unit: undefined,
    value: null
  },
  // Keyed on the control, so changing `value` in the controls panel starts the field over.
  render: args => <EditableNumberField {...args} key={String(args.value)} />,
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty, with every prop at its default. */
export const Default = {} satisfies Story;

/** A threshold: what it's counted in follows the value. */
export const WithUnit = {
  args: { label: 'Warning below', max: 100, min: 0, unit: '%', value: 25 }
} satisfies Story;

/** Focused: the border and the hairlines between the buttons brighten together. */
export const Focused = {
  tags: ['!dev'],
  args: { label: 'Warning below', max: 100, min: 0, unit: '%', value: 25 },
  play: async () => {
    await userEvent.click(screen.getByRole('textbox', { name: 'Warning below' }));
  }
} satisfies Story;

export const WithError = {
  args: { error: 'Warning must be above critical.', label: 'Warning below', unit: '%', value: 5 }
} satisfies Story;

export const Disabled = { args: { disabled: true, label: 'Warning below', unit: '%', value: 25 } } satisfies Story;

/** The buttons and arrow keys step the value, and it stops at `max`. */
export const Stepping = {
  tags: ['!dev', '!visual'],
  args: { label: 'Warning below', max: 27, min: 0, unit: '%', value: 25 },
  play: async () => {
    const field = screen.getByRole('textbox', { name: 'Warning below' });

    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    await expect(field).toHaveValue('26');

    await userEvent.click(field);
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(field).toHaveValue('27');

    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    await expect(field).toHaveValue('26');
  }
} satisfies Story;

/** The hairlines between the buttons always take the colour of the border around them. */
export const HairlinesFollowTheBorder = {
  tags: ['!dev', '!visual'],
  args: { error: 'Warning must be above critical.', label: 'Warning below', unit: '%', value: 5 },
  play: async () => {
    const increase = screen.getByRole('button', { name: 'Increase' });
    const group = increase.parentElement;

    if (!group) {
      throw new Error('No group around the buttons');
    }

    const matches = () =>
      [increase, screen.getByRole('button', { name: 'Decrease' })].every(
        button => getComputedStyle(button).borderLeftColor === getComputedStyle(group).borderTopColor
      );

    await expect(matches()).toBe(true);
    await userEvent.click(screen.getByRole('textbox', { name: 'Warning below' }));
    await expect(matches()).toBe(true);
  }
} satisfies Story;
