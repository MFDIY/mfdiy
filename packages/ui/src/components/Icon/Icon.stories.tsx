import type { Meta, StoryObj } from '@storybook/react-vite';

import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import { Icon, iconNames } from './Icon.js';

const meta = {
  title: 'Components / Icon',
  component: Icon,
  argTypes: {
    label: { control: { type: 'text' } },
    name: { control: { type: 'select' }, options: iconNames }
  },
  args: {
    label: undefined,
    name: 'close'
  }
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Takes the colour of the text around it. */
export const Default = {} satisfies Story;

/** Every icon there is, by name. */
export const All = {
  render: () => (
    <Inline spacing='5x'>
      {iconNames.map(name => (
        <Stack key={name} spacing='2x'>
          <Icon name={name} />
          <Text color='text.dim' variant='body'>
            {name}
          </Text>
        </Stack>
      ))}
    </Inline>
  )
} satisfies Story;

/** Beside text, as in a control. */
export const WithText = {
  render: () => (
    <Inline alignItems='center' spacing='2x'>
      <Icon name='content_copy' />
      <Text variant='body'>Duplicate</Text>
    </Inline>
  )
} satisfies Story;
