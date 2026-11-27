import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';
import { Button } from '../Button/Button.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import { Sheet, stops } from './Sheet.js';

const widgets = [
  ['Bar', 'A linear gauge for a number signal.'],
  ['Button', 'Triggers a game action.'],
  ['Light', 'An annunciator light for an on/off signal.'],
  ['Readout', 'Shows the value of any signal as text.']
] as const;

function WidgetList({ repeat = 1 }: { repeat?: number }) {
  return (
    <Stack spacing='5x'>
      {Array.from({ length: repeat }, (_, round) =>
        widgets.map(([name, description]) => (
          <Stack key={`${round}-${name}`} spacing='2x'>
            <Text variant='body'>{name}</Text>
            <Text color='text.dim' variant='body'>
              {description}
            </Text>
          </Stack>
        ))
      )}
    </Stack>
  );
}

/**
 * The sheet's `open` is the page's to keep, so the story keeps it, as a page would: a button opens
 * it, and closing it really closes it. A "canvas" button stays pressable while it's open.
 */
function SheetOnAPage({ open: initiallyOpen, onClose, ...restProps }: ComponentProps<typeof Sheet>) {
  const [open, setOpen] = useState(initiallyOpen);
  const [presses, setPresses] = useState(0);

  return (
    <>
      <Inline spacing='3x'>
        <Button onClick={() => setOpen(true)} variant='primary'>
          Open sheet
        </Button>
        <Button onClick={() => setPresses(presses + 1)}>
          {presses === 0 ? 'Press the canvas' : `Pressed ${presses}×`}
        </Button>
      </Inline>
      <Sheet
        {...restProps}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        onOpen={() => setOpen(true)}
        open={open}
      />
    </>
  );
}

/** Opens the sheet with its button and waits until it has finished sliding in. */
async function openSheet() {
  await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }));

  const sheet = await screen.findByRole('dialog');

  await waitFor(() => expect(sheet).not.toHaveAttribute('data-starting-style'));
  await Promise.all(sheet.getAnimations().map(animation => animation.finished));
}

const meta = {
  title: 'Components / Sheet',
  component: Sheet,
  argTypes: {
    children: { control: false },
    defaultStop: createArgTypeFromConditionalStyleProp(stops, undefined, 'half'),
    open: { control: { type: 'boolean' } },
    title: { control: { type: 'text' } }
  },
  args: {
    children: undefined,
    defaultStop: undefined,
    modal: false,
    onClose: fn(),
    open: false,
    peek: false,
    title: 'Sheet'
  },
  // Keyed, so changing a control starts the story over with it.
  render: args => <SheetOnAPage key={`${args.open}-${args.defaultStop}-${args.peek}-${args.modal}`} {...args} />
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed, with every prop at its default: press "Open sheet". */
export const Default = {} satisfies Story;

/** Half open: what's above it stays in view and can still be pressed. */
export const Half = {
  args: { children: <WidgetList />, title: 'Add a widget' },
  play: openSheet
} satisfies Story;

export const Full = {
  args: { children: <WidgetList />, defaultStop: 'full', title: 'Add a widget' },
  play: openSheet
} satisfies Story;

/** Only the content scrolls, inside the visible part of the sheet. */
export const LongContent = {
  args: { children: <WidgetList repeat={6} />, title: 'Add a widget' },
  play: openSheet
} satisfies Story;

/** The chevron moves between the stops, for anyone who can't drag. */
export const ChevronTogglesStops = {
  // Checks behaviour; the stories above cover the looks.
  tags: ['!dev', '!visual'],
  args: { children: <WidgetList /> },
  play: async () => {
    await openSheet();
    await userEvent.click(screen.getByRole('button', { name: 'Expand' }));
    await expect(await screen.findByRole('button', { name: 'Collapse' })).toBeInTheDocument();
  }
} satisfies Story;

/** Not modal: the canvas behind it can still be pressed. */
export const CanvasStaysUsable = {
  tags: ['!dev', '!visual'],
  play: async () => {
    await openSheet();
    await userEvent.click(screen.getByRole('button', { name: 'Press the canvas' }));
    await expect(screen.getByRole('button', { name: 'Pressed 1×' })).toBeInTheDocument();
  }
} satisfies Story;

export const ClosesOnEscape = {
  tags: ['!dev', '!visual'],
  play: async ({ args }) => {
    await openSheet();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(args.onClose).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  }
} satisfies Story;

/** Waits until the sheet has stopped moving. */
async function settled() {
  const sheet = await screen.findByRole('dialog');

  await waitFor(() => expect(sheet).not.toHaveAttribute('data-starting-style'));
  await Promise.all(sheet.getAnimations().map(animation => animation.finished));
}

/** Closed, a peeking sheet rests at the bottom with only its title in view, to drag up again. */
export const Peeking = {
  args: { children: <WidgetList />, peek: true, title: 'Properties' },
  play: settled
} satisfies Story;

/** Expanding a peeking sheet opens it; closing it again leaves it peeking. */
export const PeekingOpensAndCloses = {
  tags: ['!dev', '!visual'],
  args: { children: <WidgetList />, peek: true, title: 'Properties' },
  play: async () => {
    await settled();
    await expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Expand' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }));
    await expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument());
  }
} satisfies Story;

/** Modal, e.g. a side task stacked on another sheet: what's behind it is darkened and can't be pressed. */
export const Modal = {
  args: { children: <WidgetList />, modal: true, title: 'Choose data' },
  play: openSheet
} satisfies Story;
