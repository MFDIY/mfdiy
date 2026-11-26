import type { Meta, StoryObj } from '@storybook/react-vite';

import { Link } from './Link.js';

const meta = {
  title: 'Components / Link',
  component: Link,
  argTypes: {
    children: { control: { type: 'text' } },
    to: { control: { type: 'text' } }
  },
  args: {
    children: 'All profiles',
    to: '/'
  }
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The unstyled base of `TextLink` and `ButtonLink`: a router link that takes style props. */
export const Default = {} satisfies Story;
