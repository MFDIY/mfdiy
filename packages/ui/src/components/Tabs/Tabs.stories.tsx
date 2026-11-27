import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

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
    underline: { control: { type: 'boolean' } },
    value: { control: { type: 'select' }, options: pages.map(page => page.value) }
  },
  args: {
    after: undefined,
    items: pages,
    label: 'Pages',
    onValueChange: () => undefined,
    underline: false,
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
/** With a hairline under the whole row, where nothing around the tabs draws one. */
export const Underlined = { args: { underline: true } } satisfies Story;

export const WithAdd = {
  args: { after: <IconButton icon='add' label='Add page' /> }
} satisfies Story;

const manyPages = ['Flight', 'Combat', 'Power', 'Shields', 'Quantum', 'Mining', 'Salvage', 'Cargo'].map(label => ({
  label,
  value: label.toLowerCase()
}));

/** A container to resize by dragging its bottom-right corner. */
function Resizable({ children }: { children: ReactNode }) {
  return (
    <div
      data-resizable
      style={{
        maxWidth: '100vw',
        minWidth: '120px',
        outline: '1px dashed #9996',
        overflow: 'hidden',
        paddingBottom: '16px',
        resize: 'horizontal',
        width: '480px'
      }}
    >
      {children}
    </div>
  );
}

/**
 * More tabs than fit: the rest go into a menu that says how many there are. Drag the container's
 * bottom-right corner to resize it and watch tabs move in and out of the menu.
 */
export const ManyTabs = {
  args: { after: <IconButton icon='add' label='Add page' />, items: manyPages },
  decorators: [
    Story => (
      <Resizable>
        <Story />
      </Resizable>
    )
  ]
} satisfies Story;

/** Narrower, more tabs go into the menu; wide enough, the menu goes away. */
export const ResizingRefits = {
  ...ManyTabs,
  tags: ['!dev', '!visual'],
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector<HTMLElement>('[data-resizable]');

    if (!container) {
      throw new Error('No container to resize');
    }

    await expect(await screen.findByRole('button', { name: '2 more' })).toBeInTheDocument();

    container.style.width = '300px';
    await expect(await screen.findByRole('button', { name: '5 more' })).toBeInTheDocument();

    container.style.width = '900px';
    await waitFor(() => expect(screen.queryByRole('button', { name: /more$/ })).not.toBeInTheDocument());
    await expect(screen.getAllByRole('tab')).toHaveLength(manyPages.length);
  }
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

const longPages = [
  { label: 'Flight', value: 'flight' },
  { label: 'Combat and targeting', value: 'combat' },
  { label: 'Power management', value: 'power' }
];

/** A tab is at most 110px wide: a longer name ends in an ellipsis, and its tooltip shows it in full. */
export const LongNames = {
  args: { after: <IconButton icon='add' label='Add page' />, items: longPages }
} satisfies Story;

/** Focusing a tab, or hovering it, names it in full. */
export const LongNameTooltip = {
  ...LongNames,
  tags: ['!dev', '!visual'],
  args: { ...LongNames.args, value: 'combat' },
  play: async () => {
    await userEvent.tab();
    await waitFor(() =>
      expect(
        screen
          .getAllByText('Combat and targeting')
          .find(element => !element.closest('[role="tab"], [aria-hidden="true"]'))
      ).toBeVisible()
    );
  }
} satisfies Story;
