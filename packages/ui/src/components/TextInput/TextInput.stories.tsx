import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, screen, userEvent } from 'storybook/test';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';

import { TextInput } from './TextInput.js';
import { types } from './props/Type.js';

const meta = {
  title: 'Components / TextInput',
  component: TextInput,
  argTypes: {
    clearLabel: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    error: { control: { type: 'boolean' } },
    placeholder: { control: { type: 'text' } },
    startButton: { control: false },
    type: createArgTypeFromConditionalStyleProp(types, undefined, 'text')
  },
  args: {
    'aria-label': 'Search',
    clearLabel: undefined,
    disabled: false,
    error: false,
    onClear: undefined,
    placeholder: undefined,
    startButton: undefined,
    type: undefined
  },
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A bare text input, without a label of its own; give it an `aria-label`. */
export const Default = {} satisfies Story;

/** With a clear button, once something is typed. */
export const Clearable = {
  args: { defaultValue: 'hydrogen', onClear: fn(), placeholder: 'Search widgets and data…' }
} satisfies Story;

export const WithError = { args: { defaultValue: 'nothing matches', error: true } } satisfies Story;

export const Disabled = { args: { defaultValue: 'hydrogen', disabled: true, onClear: fn() } } satisfies Story;

/** The clear button empties the input, keeps focus in it, and goes away. */
export const ClearEmpties = {
  tags: ['!dev', '!visual'],
  args: { defaultValue: 'hydrogen', onClear: fn() },
  play: async ({ args }) => {
    const input = screen.getByRole('textbox', { name: 'Search' });

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalledOnce();
    await expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  }
} satisfies Story;

/** A button at the start of the box, such as Back, reads as one control with the field. */
export const WithStartButton = {
  args: {
    defaultValue: 'hydrogen',
    onClear: fn(),
    placeholder: 'Search',
    startButton: { icon: 'chevron_left', label: 'Back to Fuel', onClick: fn() }
  }
} satisfies Story;
