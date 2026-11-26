import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps } from 'react';
import { expect, screen, userEvent } from 'storybook/test';

import { SegmentedControl } from './SegmentedControl.js';

/** SegmentedControl is controlled; in a story, something has to hold the choice, like a page would. */
function ChoosableSegmentedControl({
  onChange,
  value: initialValue,
  ...restProps
}: ComponentProps<typeof SegmentedControl>) {
  const [value, setValue] = useState(initialValue);

  return (
    <SegmentedControl
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
  { label: 'Warning', value: 'warning' },
  { label: 'Critical', value: 'critical' }
];

const meta = {
  title: 'Components / SegmentedControl',
  component: SegmentedControl,
  argTypes: {
    description: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    items: { control: false },
    label: { control: { type: 'text' } },
    value: { control: { type: 'select' }, options: [null, ...colours.map(colour => colour.value)] }
  },
  args: {
    description: undefined,
    disabled: false,
    error: undefined,
    items: colours,
    label: 'Label',
    onChange: () => undefined,
    value: null
  },
  // Keyed on the control, so changing `value` in the controls panel starts the field over.
  render: args => <ChoosableSegmentedControl {...args} key={String(args.value)} />,
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen yet, with every prop at its default. */
export const Default = {} satisfies Story;

export const Chosen = { args: { label: 'Colour when lit', value: 'warning' } } satisfies Story;

export const WithError = {
  args: { error: 'Choose a colour the theme has.', label: 'Colour when lit', value: 'critical' }
} satisfies Story;

export const Disabled = { args: { disabled: true, label: 'Colour when lit', value: 'warning' } } satisfies Story;

export const ClickChooses = {
  tags: ['!dev', '!visual'],
  args: { label: 'Colour when lit', value: 'warning' },
  play: async () => {
    await userEvent.click(screen.getByRole('radio', { name: 'Critical' }));
    await expect(screen.getByRole('radio', { name: 'Critical' })).toBeChecked();
    await expect(screen.getByRole('radio', { name: 'Warning' })).not.toBeChecked();
  }
} satisfies Story;

/** The group is named by its label; arrow keys move the choice; the frame stays as it is. */
export const KeyboardChooses = {
  tags: ['!dev', '!visual'],
  args: { label: 'Colour when lit', value: 'warning' },
  play: async () => {
    const group = screen.getByRole('radiogroup', { name: 'Colour when lit' });
    const resting = getComputedStyle(group).borderTopColor;

    await userEvent.tab();
    await expect(getComputedStyle(group).borderTopColor).toBe(resting);
    await userEvent.keyboard('{ArrowRight}');
    await expect(screen.getByRole('radio', { name: 'Critical' })).toBeChecked();
  }
} satisfies Story;
