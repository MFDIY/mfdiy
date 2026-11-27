import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';
import { expect, screen, userEvent } from 'storybook/test';

import { NumberField } from '../NumberField/NumberField.js';

import { Toggletip } from './Toggletip.js';

const meta = {
  title: 'Components / Toggletip',
  component: Toggletip,
  argTypes: {
    children: { control: { type: 'text' } },
    label: { control: { type: 'text' } }
  },
  args: {
    children: 'Widgets keep their share of the page when the grid changes.',
    label: 'About Grid'
  },
  decorators: [
    Story => (
      <div style={{ paddingTop: '120px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Toggletip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A small info button; its hint stays out of the way until asked for. */
export const Default = {} satisfies Story;

/** Pressed (or tapped, or hovered with a mouse), it shows its hint above it. */
export const Open = {
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'About Grid' }));
    await expect(await screen.findByText('Widgets keep their share of the page when the grid changes.')).toBeVisible();
  }
} satisfies Story;

function GridField() {
  const [value, setValue] = useState<number | null>(24);

  return (
    <div style={{ width: '200px' }}>
      <NumberField
        description='How many cells wide the page is.'
        label='Columns'
        max={48}
        min={1}
        onChange={setValue}
        value={value}
      />
    </div>
  );
}

/** A field's description is a toggletip by its label, and still describes the field to assistive technology. */
export const ByAFieldsLabel = {
  render: () => <GridField />,
  play: async () => {
    await expect(screen.getByRole('textbox', { name: 'Columns' })).toHaveAccessibleDescription(
      'How many cells wide the page is.'
    );
    await userEvent.click(screen.getByRole('button', { name: 'About Columns' }));
    await expect(await screen.findByText('How many cells wide the page is.', { ignore: '[id]' })).toBeVisible();
  }
} satisfies Story;
