import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import { TextLink } from './TextLink.js';

const meta = {
  title: 'Components / TextLink',
  component: TextLink,
  argTypes: {
    children: {
      description: "Sets the hyperlink's clickable text.",
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: 'ReactNode'
        }
      }
    },
    to: {
      type: { name: 'string', required: true },
      description: "Sets the hyperlink's destination.",
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: `string`
        }
      }
    }
  },
  decorators: [
    Story => (
      <Text>
        <Story />
      </Text>
    )
  ],
  args: {
    children: 'Lorem ipsum',
    to: '#lorem-ipsum'
  }
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const InParagraph = {
  render: args => {
    return (
      <Text variant='body'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. <TextLink {...args}>Sed lobortis</TextLink> laoreet
        arcu eget vulputate. Pellentesque diam justo, scelerisque in accumsan ultrices, dignissim id neque. Vivamus
        finibus ipsum vel elit accumsan, id venenatis lacus placerat. Phasellus feugiat elit nec nibh elementum, ac
        lobortis massa interdum. Praesent pharetra ligula mi, vitae fermentum elit auctor non. Proin massa mi,
        condimentum dignissim pulvinar id, porta in libero. Nam tincidunt odio eget euismod eleifend. Mauris in mattis
        diam. Mauris dictum dui magna, cursus consequat nibh scelerisque et.
      </Text>
    );
  }
} satisfies Story;

export const TextResponsive = {
  render: args => {
    return (
      <Stack spacing='5x'>
        <Text variant='heading'>
          <TextLink {...args}>Lorem ipsum</TextLink>
        </Text>
        <Text variant='heading'>
          <TextLink {...args}>Lorem ipsum</TextLink>
        </Text>
        <Text variant='heading'>
          <TextLink {...args}>Lorem ipsum</TextLink>
        </Text>
        <Text variant='heading'>
          <TextLink {...args}>Lorem ipsum</TextLink>
        </Text>
      </Stack>
    );
  }
} satisfies Story;
