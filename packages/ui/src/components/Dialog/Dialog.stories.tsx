import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';
import { expect, screen } from 'storybook/test';

import { Button } from '../Button/Button.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';
import { TextField } from '../TextField/TextField.js';

import { Dialog } from './Dialog.js';
import { DialogPresentationContext } from './DialogPresentation.js';

const meta = {
  title: 'Components / Dialog',
  component: Dialog,
  argTypes: {
    // Content, not settings: each story provides its own.
    actions: { control: false },
    children: { control: false },
    dismissible: {
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'false' }, type: { summary: 'boolean' } }
    },
    title: { control: { type: 'text' } }
  },
  args: {
    dismissible: false,
    title: 'Save changes to “Fighter”?',
    onClose: () => undefined
  },
  decorators: [
    // On the docs page, dialogs are drawn in place: modals would stack and block the page's controls.
    (Story, context) => (
      <DialogPresentationContext value={context.viewMode === 'docs' ? 'inline' : 'modal'}>
        <Story />
      </DialogPresentationContext>
    )
  ]
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A decision that has to be made: no close button, and Escape or a press outside does nothing. */
export const Confirm = {
  args: {
    children: <Text variant='body'>Displays keep showing the saved version.</Text>,
    actions: (
      <>
        <Button variant='primary'>Save</Button>
        <Button>Keep editing</Button>
      </>
    )
  },
  play: async () => {
    // Focus starts on the dialog, never on a button.
    await expect(screen.getByRole('alertdialog')).toHaveFocus();
  }
} satisfies Story;

/** Something that can't be undone, started by the user, so they may also walk away from it. */
export const Destructive = {
  args: {
    dismissible: true,
    title: 'Delete “Fighter”?',
    children: <Text variant='body'>Displays showing this profile go back to the profile list.</Text>,
    actions: (
      <>
        <Button variant='danger'>Delete</Button>
        <Button>Cancel</Button>
      </>
    )
  },
  play: async () => {
    await expect(screen.getByRole('button', { name: 'Delete' })).not.toHaveFocus();
  }
} satisfies Story;

function NameField() {
  const [name, setName] = useState('Fighter (copy)');

  return <TextField label='Name' onChange={setName} value={name} />;
}

/** A small form: focus starts in its field. */
export const Form = {
  args: {
    dismissible: true,
    title: 'Save as new profile',
    children: <NameField />,
    actions: (
      <>
        <Button variant='primary'>Save</Button>
        <Button>Cancel</Button>
      </>
    )
  },
  play: async () => {
    await expect(screen.getByRole('textbox')).toHaveFocus();
  }
} satisfies Story;

/** Three ways out, as when leaving with unsaved changes. They wrap on a narrow screen. */
export const ThreeActions = {
  args: {
    actions: (
      <>
        <Button variant='primary'>Save</Button>
        <Button variant='danger'>Discard</Button>
        <Button>Keep editing</Button>
      </>
    )
  }
} satisfies Story;

/** More than fits: only the content scrolls; the title and actions stay in view (0007). */
export const LongContent = {
  args: {
    title: '“Fighter” was changed on another device',
    children: (
      <Stack spacing='5x'>
        {Array.from({ length: 12 }, (_, index) => (
          <Text key={index} variant='body'>
            Your changes aren’t saved, but they’re still here. Save them as a new profile, or discard them and keep the
            version from the other device.
          </Text>
        ))}
      </Stack>
    ),
    actions: (
      <>
        <Button variant='primary'>Save as new</Button>
        <Button>Keep editing</Button>
      </>
    )
  }
} satisfies Story;
