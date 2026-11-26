import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { Button } from '../Button/Button.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';
import { TextField } from '../TextField/TextField.js';

import { Dialog } from './Dialog.js';

const meta = {
  title: 'Components / Dialog',
  component: Dialog,
  argTypes: {
    title: { control: { type: 'text' } }
  },
  args: {
    title: 'Save changes to “Fighter”?',
    onClose: () => undefined
  },
  parameters: {
    // Each dialog is modal, so on the docs page every story gets its own frame instead of stacking.
    docs: { story: { inline: false, height: '420px' } }
  }
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A decision with one obvious answer. */
export const Confirm = {
  args: {
    children: (
      <Stack spacing='5x'>
        <Text variant='body'>Displays keep showing the saved version.</Text>
        <Inline spacing='3x'>
          <Button variant='primary'>Save</Button>
          <Button>Keep editing</Button>
        </Inline>
      </Stack>
    )
  }
} satisfies Story;

/** Something that can't be undone. */
export const Destructive = {
  args: {
    title: 'Delete “Fighter”?',
    children: (
      <Stack spacing='5x'>
        <Text variant='body'>Displays showing this profile go back to the profile list.</Text>
        <Inline spacing='3x'>
          <Button variant='danger'>Delete</Button>
          <Button>Cancel</Button>
        </Inline>
      </Stack>
    )
  }
} satisfies Story;

function NameForm() {
  const [name, setName] = useState('Fighter (copy)');

  return (
    <Stack spacing='5x'>
      <TextField label='Name' onChange={setName} value={name} />
      <Inline spacing='3x'>
        <Button variant='primary'>Save</Button>
        <Button>Cancel</Button>
      </Inline>
    </Stack>
  );
}

/** A small form: naming a new or copied profile. */
export const Form = {
  args: {
    title: 'Save as new profile',
    children: <NameForm />
  }
} satisfies Story;

/** Three ways out, as when leaving with unsaved changes. They wrap on a narrow screen. */
export const ThreeActions = {
  args: {
    children: (
      <Inline spacing='3x'>
        <Button variant='primary'>Save</Button>
        <Button variant='danger'>Discard</Button>
        <Button>Keep editing</Button>
      </Inline>
    )
  }
} satisfies Story;

/** More than fits: the dialog scrolls inside, never the page (0007). */
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
        <Inline spacing='3x'>
          <Button variant='primary'>Save as new</Button>
          <Button>Keep editing</Button>
        </Inline>
      </Stack>
    )
  }
} satisfies Story;
