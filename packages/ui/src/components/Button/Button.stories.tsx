import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button.js';

const meta = {
  title: 'Components / Button',
  component: Button,
  args: {
    children: 'Lorem ipsum',
    disabled: false
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

/** A transparent button used on elevated surfaces. */
export const Transparent = { args: { variant: 'transparent' } } satisfies Story;

/** A button visually indicating destructive actions. */
export const Destructive = { args: { variant: 'destructive' } } satisfies Story;

/** A yellow button for actions requiring moderate attention. */
export const Attention = { args: { variant: 'attention' } } satisfies Story;
