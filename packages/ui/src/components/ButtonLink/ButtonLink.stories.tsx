import type { Meta, StoryObj } from '@storybook/react-vite';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';
import { variants } from '../Button/props/Variant.js';

import { ButtonLink } from './ButtonLink.js';

const meta = {
  title: 'Components / ButtonLink',
  component: ButtonLink,
  argTypes: {
    children: { control: { type: 'text' } },
    to: { control: { type: 'text' } },
    variant: createArgTypeFromConditionalStyleProp(variants, undefined, 'default')
  },
  args: {
    children: 'All profiles',
    to: '/',
    variant: undefined
  }
} satisfies Meta<typeof ButtonLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Looks like a Button, but goes to another page. */
export const Default = {} satisfies Story;

export const Primary = { args: { children: 'New profile', variant: 'primary' } } satisfies Story;
