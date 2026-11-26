import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent } from 'storybook/test';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';
import { variants } from '../Button/Button.js';
import { iconNames } from '../Icon/Icon.js';
import { Inline } from '../Inline/Inline.js';

import { IconButton } from './IconButton.js';

const meta = {
  title: 'Components / IconButton',
  component: IconButton,
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    icon: { control: { type: 'select' }, options: iconNames },
    label: { control: { type: 'text' } },
    variant: createArgTypeFromConditionalStyleProp(variants, undefined, 'quiet')
  },
  args: {
    disabled: false,
    icon: 'undo',
    label: 'Undo',
    variant: undefined
  }
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover or focus it to see its name. */
export const Default = {} satisfies Story;

/** With the outline of a default button. */
export const Outlined = { args: { variant: 'default' } } satisfies Story;

export const Disabled = { args: { disabled: true } } satisfies Story;

/** A toolbar: each button names itself on hover or focus. */
export const Toolbar = {
  render: () => (
    <Inline spacing='1x'>
      <IconButton icon='undo' label='Undo' />
      <IconButton icon='redo' label='Redo' />
      <IconButton icon='content_copy' label='Duplicate' />
      <IconButton icon='delete' label='Remove' />
      <IconButton icon='more_horiz' label='More' />
    </Inline>
  )
} satisfies Story;

/** Focus shows the name, as hover does with a mouse. */
export const FocusShowsName = {
  tags: ['!dev'],
  play: async () => {
    await userEvent.tab();
    await expect(await screen.findByText('Undo')).toBeVisible();
  }
} satisfies Story;
