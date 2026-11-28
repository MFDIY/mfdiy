import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';

import { Menu, MenuItem, MenuSeparator } from './Menu.js';

const onSaveAsNew = fn();
const onRemove = fn();
const onOpenChange = fn();

const meta = {
  title: 'Components / Menu',
  component: Menu,
  argTypes: {
    children: { control: false },
    onOpenChange: { control: false },
    trigger: { control: false }
  },
  args: {
    children: (
      <>
        <MenuItem onClick={onSaveAsNew}>Save as new</MenuItem>
        <MenuItem onClick={fn()}>Rename</MenuItem>
      </>
    ),
    onOpenChange: undefined,
    trigger: <IconButton icon='more_horiz' label='More' />
  },
  beforeEach: () => {
    onSaveAsNew.mockClear();
    onRemove.mockClear();
    onOpenChange.mockClear();
  }
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Press the button to open it. */
export const Default = {} satisfies Story;

/**
 * Icons before the text, an item without one inset to line up, a disabled item, and a destructive
 * one in a group of its own.
 */
export const Open = {
  tags: ['!dev'],
  args: {
    children: (
      <>
        <MenuItem icon='content_copy' onClick={fn()}>
          Duplicate
        </MenuItem>
        <MenuItem disabled icon='add' onClick={fn()}>
          Add page
        </MenuItem>
        <MenuItem inset onClick={fn()}>
          Save as new…
        </MenuItem>
        <MenuSeparator />
        <MenuItem danger icon='delete' onClick={onRemove}>
          Remove
        </MenuItem>
      </>
    )
  },
  play: async ({ userEvent: user }) => {
    await user.click(screen.getByRole('button', { name: 'More' }));
    await expect(await screen.findByRole('menuitem', { name: 'Duplicate' })).toBeVisible();
  }
} satisfies Story;

/** Choosing an item runs it and closes the menu. */
export const ClickChooses = {
  tags: ['!dev', '!visual'],
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Save as new' }));

    await expect(onSaveAsNew).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  }
} satisfies Story;

/** The keyboard opens it on the first item, moves through it and chooses. */
export const KeyboardChooses = {
  tags: ['!dev', '!visual'],
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(await screen.findByRole('menuitem', { name: 'Save as new' })).toHaveAttribute('data-highlighted');
    await userEvent.keyboard('{ArrowDown}');
    await expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveAttribute('data-highlighted');
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Enter}');

    await expect(onSaveAsNew).toHaveBeenCalledOnce();
  }
} satisfies Story;

/**
 * A trigger given as a function knows whether its menu is open, so it can look different while it
 * is: here, a dropdown that turns primary.
 */
export const TriggerKnowsItsOpen = {
  tags: ['!dev'],
  args: {
    trigger: open => (
      <Button icon='unfold_more' iconPosition='trailing' variant={open ? 'primary' : 'default'}>
        Fuel
      </Button>
    )
  },
  play: async ({ userEvent: user }) => {
    await user.click(screen.getByRole('button', { name: 'Fuel' }));
    await screen.findByRole('menu');
  }
} satisfies Story;

/** Anything else on the page can follow the menu opening and closing. */
export const ReportsOpening = {
  tags: ['!dev', '!visual'],
  args: { onOpenChange },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    await screen.findByRole('menu');
    await expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
  }
} satisfies Story;

/**
 * A menu longer than the room below its trigger scrolls inside itself; the page doesn't scroll, and
 * the arrow keys bring the highlighted item into view.
 */
export const LongerThanTheScreen = {
  tags: ['!dev'],
  args: {
    children: Array.from({ length: 40 }, (_, index) => (
      <MenuItem key={index} onClick={fn()}>{`Action ${index + 1}`}</MenuItem>
    ))
  },
  play: async ({ userEvent: user }) => {
    await user.click(screen.getByRole('button', { name: 'More' }));
    const menu = await screen.findByRole('menu');
    await expect(menu.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
    await expect(document.documentElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight);
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Action 1' })).toHaveAttribute('data-highlighted'));
    await user.keyboard('{ArrowUp}');
    const last = screen.getByRole('menuitem', { name: 'Action 40' });
    await waitFor(() => expect(last).toHaveAttribute('data-highlighted'));
    await waitFor(() => expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight));
  }
} satisfies Story;
