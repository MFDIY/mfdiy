import type { Meta, StoryObj } from '@storybook/react-vite';

import { Placeholder } from '../Placeholder/Placeholder.js';

import { Field } from './Field.js';

const meta = {
  title: 'Components / Field',
  component: Field,
  argTypes: {
    children: { control: false },
    description: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    label: { control: { type: 'text' } }
  },
  args: {
    children: <Placeholder height='32px' />,
    description: undefined,
    disabled: false,
    error: undefined,
    label: 'Label'
  },
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A label over any control; the placeholder stands in for one. */
export const Default = {} satisfies Story;

export const WithDescription = {
  args: { description: 'Shown on the display above the value.', label: 'Label' }
} satisfies Story;

export const WithError = {
  args: { error: 'Warning must be above critical.', label: 'Warning below' }
} satisfies Story;

export const Disabled = { args: { disabled: true } } satisfies Story;
