import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { Select } from './Select.js';

/** Select is controlled; in a story, something has to hold the choice, like a page would. */
function ChoosableSelect({ onChange, value: initialValue, ...restProps }: ComponentProps<typeof Select>) {
  const [value, setValue] = useState(initialValue);

  return (
    <Select
      {...restProps}
      onChange={next => {
        setValue(next);
        onChange(next);
      }}
      value={value}
    />
  );
}

const colours = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Warning', value: 'warning' },
  { label: 'Critical', value: 'critical' }
];

const meta = {
  title: 'Components / Select',
  component: Select,
  argTypes: {
    clearable: { control: { type: 'boolean' } },
    description: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    items: { control: false },
    label: { control: { type: 'text' } },
    placeholder: { control: { type: 'text' } },
    value: { control: { type: 'select' }, options: [null, ...colours.map(colour => colour.value)] }
  },
  args: {
    clearable: false,
    description: undefined,
    disabled: false,
    error: undefined,
    items: colours,
    label: 'Label',
    onChange: () => undefined,
    placeholder: undefined,
    value: null
  },
  // Keyed on the control, so changing `value` in the controls panel starts the field over.
  render: args => <ChoosableSelect {...args} key={String(args.value)} />,
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen, with every prop at its default. */
export const Default = {} satisfies Story;

export const Chosen = { args: { label: 'Colour when lit', value: 'warning' } } satisfies Story;

export const WithPlaceholder = {
  args: { label: 'Colour when lit', placeholder: 'Choose a colour' }
} satisfies Story;

/** Open: the list drops below like a menu, the chosen item ticked, and the field stays bright. */
export const Open = {
  tags: ['!dev'],
  args: { label: 'Colour when lit', value: 'warning' },
  play: async () => {
    await userEvent.click(screen.getByRole('combobox', { name: 'Colour when lit' }));
    await expect(await screen.findByRole('option', { name: 'Critical' })).toBeVisible();
  }
} satisfies Story;

/** Clearable: a button beside the field empties the choice, while there is one. */
export const Clearable = {
  args: { clearable: true, label: 'Colour when lit', placeholder: 'Theme default', value: 'warning' }
} satisfies Story;

export const WithError = {
  args: { error: 'Choose a colour the theme has.', label: 'Colour when lit', value: 'secondary' }
} satisfies Story;

export const Disabled = { args: { disabled: true, label: 'Colour when lit', value: 'warning' } } satisfies Story;

/** Choosing an item closes the list and shows the choice. */
export const ClickChooses = {
  tags: ['!dev', '!visual'],
  args: { label: 'Colour when lit', value: 'warning' },
  play: async () => {
    const field = screen.getByRole('combobox', { name: 'Colour when lit' });

    await userEvent.click(field);
    await userEvent.click(await screen.findByRole('option', { name: 'Critical' }));

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(field).toHaveTextContent('Critical');
  }
} satisfies Story;

/** The keyboard opens it on the chosen item, moves through it and chooses. */
export const KeyboardChooses = {
  tags: ['!dev', '!visual'],
  args: { label: 'Colour when lit', value: 'primary' },
  play: async () => {
    const field = screen.getByRole('combobox', { name: 'Colour when lit' });

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Primary' })).toHaveAttribute('data-highlighted'));
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Secondary' })).toHaveAttribute('data-highlighted'));
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(field).toHaveTextContent('Secondary'));
  }
} satisfies Story;

/** Clearing empties the choice, shows the placeholder again, and leaves focus on the field. */
export const ClearEmpties = {
  tags: ['!dev', '!visual'],
  args: { clearable: true, label: 'Colour when lit', placeholder: 'Theme default', value: 'warning' },
  play: async () => {
    const field = screen.getByRole('combobox', { name: 'Colour when lit' });

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

    await expect(field).toHaveTextContent('Theme default');
    await expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    await expect(field).toHaveFocus();
  }
} satisfies Story;
