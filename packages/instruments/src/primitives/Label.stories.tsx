import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from './Label.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Label',
  component: Label,
  decorators: [mfdFrame],
  argTypes: {
    text: { control: { type: 'text' } }
  },
  args: {
    text: 'Label'
  }
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Static text. */
export const Default = {} satisfies Story;

export const LongText = { args: { text: 'Quantum drive' } } satisfies Story;
