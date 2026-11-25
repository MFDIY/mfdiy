import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import { Dialog } from './Dialog.js';

const meta = {
  title: 'Components / Dialog',
  component: Dialog,
  args: {
    title: 'Save changes to “Fighter”?',
    onClose: () => undefined,
    children: (
      <Stack spacing='5x'>
        <Text variant='body'>Displays keep showing the saved version.</Text>
        <Inline spacing='3x'>
          <Button size='large' variant='attention'>
            Save
          </Button>
          <Button size='large'>Keep editing</Button>
        </Inline>
      </Stack>
    )
  }
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
