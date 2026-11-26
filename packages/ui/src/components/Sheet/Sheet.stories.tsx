import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';
import { Box } from '../Box/Box.js';
import { Button } from '../Button/Button.js';
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

/** Stands in for the builder's canvas: still pressable while the sheet is open. */
function Behind() {
  const [presses, setPresses] = useState(0);

  return (
    <Box padding='5x'>
      <Button onClick={() => setPresses(presses + 1)}>
        {presses === 0 ? 'Press the canvas' : `Pressed ${presses}×`}
      </Button>
    </Box>
  );
}

const meta = {
  title: 'Components / Sheet',
  component: Sheet,
  // A sheet is pinned to the bottom of the window, so on one docs page they'd pile up.
  tags: ['!autodocs'],
  argTypes: {
    children: { control: false },
    defaultStop: createArgTypeFromConditionalStyleProp(stops, undefined, 'half'),
    open: { control: { type: 'boolean' } },
    title: { control: { type: 'text' } }
  },
  args: {
    children: <WidgetList />,
    defaultStop: 'half',
    onClose: fn(),
    open: true,
    title: 'Add a widget'
  },
  // Keyed, so picking another stop in the controls starts the sheet there.
  render: args => (
    <>
      <Behind />
      <Sheet key={args.defaultStop} {...args} />
    </>
  )
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Half open: what's above stays in view and usable. */
export const Half = {} satisfies Story;

export const Full = { args: { defaultStop: 'full' } } satisfies Story;

/** Only the content scrolls, inside the visible part of the sheet. */
export const LongContent = { args: { children: <WidgetList repeat={6} /> } } satisfies Story;

/** The handle moves between the stops, for anyone who can't drag. */
export const HandleTogglesStops = {
  // Checks behaviour; the Half and Full stories cover the looks, and a pointer left on a button can't be screenshotted the same twice.
  tags: ['!dev', '!visual'],
  play: async () => {
    await userEvent.click(await screen.findByRole('button', { name: 'Expand' }));
    await expect(await screen.findByRole('button', { name: 'Collapse' })).toBeInTheDocument();
  }
} satisfies Story;

/** Not modal: the canvas behind it can still be pressed. */
export const CanvasStaysUsable = {
  // Checks behaviour; the Half and Full stories cover the looks, and a pointer left on a button can't be screenshotted the same twice.
  tags: ['!dev', '!visual'],
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Press the canvas' }));
    await expect(screen.getByRole('button', { name: 'Pressed 1×' })).toBeInTheDocument();
  }
} satisfies Story;

export const ClosesOnEscape = {
  // Checks behaviour; the Half and Full stories cover the looks, and a pointer left on a button can't be screenshotted the same twice.
  tags: ['!dev', '!visual'],
  play: async ({ args }) => {
    await screen.findByRole('button', { name: 'Expand' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(args.onClose).toHaveBeenCalled());
  }
} satisfies Story;
