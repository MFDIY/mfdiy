import type { Meta, StoryObj } from '@storybook/react-vite';

import { Placeholder } from './Placeholder.js';

const meta = {
  title: 'Components / Placeholder',
  component: Placeholder,
  argTypes: {
    aspectRatio: { control: { type: 'text' } },
    height: { control: { type: 'text' } },
    width: { control: { type: 'text' } }
  },
  args: {
    aspectRatio: undefined,
    height: undefined,
    width: undefined
  },
  decorators: [
    Story => (
      <div style={{ height: '160px', width: '240px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Placeholder>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Stands in for content that isn't there yet; fills its container by default. */
export const Default = {} satisfies Story;

export const Square = { args: { aspectRatio: '1 / 1', height: 'auto', width: '120px' } } satisfies Story;
