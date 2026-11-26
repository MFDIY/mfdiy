import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps } from 'react';
import { expect, screen, userEvent } from 'storybook/test';

import { Switch } from './Switch.js';

/** Switch is controlled; in a story, something has to hold whether it's on, like a page would. */
function ToggleableSwitch({ checked: initialChecked, onChange, ...restProps }: ComponentProps<typeof Switch>) {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <Switch
      {...restProps}
      checked={checked}
      onChange={next => {
        setChecked(next);
        onChange(next);
      }}
    />
  );
}

const meta = {
  title: 'Components / Switch',
  component: Switch,
  argTypes: {
    checked: { control: { type: 'boolean' } },
    description: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    label: { control: { type: 'text' } }
  },
  args: {
    checked: false,
    description: undefined,
    disabled: false,
    error: undefined,
    label: 'Label',
    onChange: () => undefined
  },
  // Keyed on the control, so changing `checked` in the controls panel starts the switch over.
  render: args => <ToggleableSwitch {...args} key={String(args.checked)} />,
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Off, with every prop at its default. */
export const Default = {} satisfies Story;

export const On = { args: { checked: true, label: 'Show label' } } satisfies Story;

export const WithDescription = {
  args: { description: 'Pressing the light on the display triggers its action.', label: 'Trigger action' }
} satisfies Story;

export const Disabled = { args: { checked: true, disabled: true, label: 'Only while held' } } satisfies Story;

/** Several options read like a settings list: labels left, switches right, rows tight. */
export const Options = {
  render: args => (
    <div>
      <ToggleableSwitch {...args} checked label='Show label' />
      <ToggleableSwitch {...args} checked={false} label='Trigger action when pressed' />
      <ToggleableSwitch {...args} checked={false} disabled label='Only while held' />
    </div>
  )
} satisfies Story;

/** Pressing the switch, or its label, or Space while it's focused, toggles it. */
export const Toggling = {
  tags: ['!dev', '!visual'],
  args: { label: 'Show label' },
  play: async () => {
    const control = screen.getByRole('switch', { name: 'Show label' });

    await userEvent.click(control);
    await expect(control).toBeChecked();

    await userEvent.click(screen.getByText('Show label'));
    await expect(control).not.toBeChecked();

    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
  }
} satisfies Story;
