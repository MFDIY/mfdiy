import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';
import { elevations } from '../Surface/Surface.js';

import { TextInput } from './TextInput.js';
import { types } from './props/Type.js';

const meta = {
  title: 'Components / TextInput',
  component: TextInput,
  argTypes: {
    elevation: createArgTypeFromConditionalStyleProp(elevations, undefined, 'base'),
    error: { control: { type: 'boolean' } },
    hideFocusRing: { control: { type: 'boolean' } },
    placeholder: { control: { type: 'text' } },
    type: createArgTypeFromConditionalStyleProp(types, undefined, 'text')
  },
  args: {
    'aria-label': 'Search',
    elevation: undefined,
    error: false,
    hideFocusRing: false,
    onClear: undefined,
    placeholder: undefined,
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

/** A bare text input, without a label of its own: the search field in pickers. */
export const Default = {} satisfies Story;

/** With a clear button, once something is typed. */
export const Clearable = {
  args: { defaultValue: 'hydrogen', onClear: fn(), placeholder: 'Search widgets and data…' }
} satisfies Story;

export const WithError = { args: { defaultValue: 'nothing matches', error: true } } satisfies Story;
