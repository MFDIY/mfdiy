import type { Meta, StoryObj } from '@storybook/react-vite';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';
import { containerSizeConditionalProperties } from '../../styles/sprinkles.css.js';
import { iconNames } from '../Icon/Icon.js';

import { Button, iconPositions, variants, widths } from './Button.js';

const meta = {
  title: 'Components / Button',
  component: Button,
  argTypes: {
    children: {
      description: 'The label.',
      control: { type: 'text' },
      table: { type: { summary: 'ReactNode' } }
    },
    disabled: {
      description: 'Disables the button.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean' } }
    },
    icon: { control: { type: 'select' }, options: iconNames },
    iconPosition: createArgTypeFromConditionalStyleProp(iconPositions, undefined, 'leading'),
    variant: createArgTypeFromConditionalStyleProp(variants, undefined, 'default'),
    width: createArgTypeFromConditionalStyleProp(widths, containerSizeConditionalProperties.conditions, 'fit-content')
  },
  args: {
    children: 'Apply',
    disabled: false,
    icon: undefined,
    iconPosition: undefined
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A hairline outline: most actions. */
export const Default = {} satisfies Story;

/** Solid and inverted: the one action a screen is for, like Save. */
export const Primary = { args: { children: 'Save', variant: 'primary' } } satisfies Story;

/** No outline, for toolbars and buttons inside other controls. */
export const Quiet = { args: { variant: 'quiet' } } satisfies Story;

/** Destructive actions, like Delete. */
export const Danger = { args: { children: 'Delete', variant: 'danger' } } satisfies Story;

export const Disabled = { args: { disabled: true } } satisfies Story;

/** An icon before the text. */
export const WithIcon = { args: { children: 'Duplicate', icon: 'content_copy' } } satisfies Story;

/** An icon after the text, e.g. for a choice that opens more. */
export const WithTrailingIcon = {
  args: { children: 'Fuel', icon: 'unfold_more', iconPosition: 'trailing' }
} satisfies Story;

/** Only an icon: square, named with `aria-label`. Use `IconButton`, which also shows the name as a tooltip. */
export const IconOnly = { args: { 'aria-label': 'Undo', children: undefined, icon: 'undo' } } satisfies Story;
