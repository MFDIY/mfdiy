import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps } from 'react';
import { expect, screen, userEvent } from 'storybook/test';

import { IconButton } from '../IconButton/IconButton.js';

import { Tabs } from './Tabs.js';

/** Tabs are controlled; in a story, something has to hold the active tab, like a page would. */
function SwitchableTabs({ onValueChange, value: initialValue, ...restProps }: ComponentProps<typeof Tabs>) {
  const [value, setValue] = useState(initialValue);

  return (
    <Tabs
      {...restProps}
      onValueChange={next => {
        setValue(next);
        onValueChange(next);
      }}
      value={value}
    />
  );
}

const pages = [
  { label: 'Flight', value: 'flight' },
  { label: 'Combat', value: 'combat' },
  { label: 'Power', value: 'power' }
];

const meta = {
  title: 'Components / Tabs',
  component: Tabs,
  argTypes: {
    after: { control: false },
    items: { control: false },
    label: { control: { type: 'text' } },
    value: { control: { type: 'select' }, options: pages.map(page => page.value) }
  },
  args: {
    after: undefined,
    items: pages,
    label: 'Pages',
    onValueChange: () => undefined,
    value: 'flight'
  },
  // Keyed on the control, so changing `value` in the controls panel starts the tabs over.
  render: args => <SwitchableTabs {...args} key={args.value} />,
  decorators: [
    Story => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Press a tab, or use the arrow keys. */
export const Default = {} satisfies Story;

/** A button directly after the last tab adds one. */
export const WithAdd = {
  args: { after: <IconButton icon='add' label='Add page' /> }
} satisfies Story;

const manyPages = ['Flight', 'Combat', 'Power', 'Shields', 'Quantum', 'Mining', 'Salvage', 'Cargo'].map(label => ({
  label,
  value: label.toLowerCase()
}));

/** More tabs than fit: the rest go into a menu that says how many there are. */
export const ManyTabs = {
  args: { after: <IconButton icon='add' label='Add page' />, items: manyPages }
} satisfies Story;

/** The active tab is always shown, even when it's one of the last. */
export const ActiveTabStaysShown = {
  args: { after: <IconButton icon='add' label='Add page' />, items: manyPages, value: 'cargo' },
  play: async () => {
    await expect(screen.getByRole('tab', { name: 'Cargo' })).toHaveAttribute('aria-selected', 'true');
  }
} satisfies Story;

/** Choosing a page from the menu makes it the active tab, shown in the row. */
export const MenuPicksATab = {
  tags: ['!dev', '!visual'],
  args: { items: manyPages },
  play: async () => {
    await userEvent.click(await screen.findByRole('button', { name: /more$/ }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Cargo' }));

    await expect(await screen.findByRole('tab', { name: 'Cargo' })).toHaveAttribute('aria-selected', 'true');
  }
} satisfies Story;

export const ClickSelects = {
  tags: ['!dev', '!visual'],
  play: async () => {
    await userEvent.click(screen.getByRole('tab', { name: 'Combat' }));
    await expect(screen.getByRole('tab', { name: 'Combat' })).toHaveAttribute('aria-selected', 'true');
  }
} satisfies Story;
