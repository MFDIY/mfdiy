import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logomark } from './Logomark.js';

/** Accents of a few MFD themes, to see the logomark take each one. */
const colors = ['#59ff9c', '#ffb547', '#ff4fd8', '#4db8ff'];

const meta = {
  title: 'Components / Logomark',
  component: Logomark,
  argTypes: {
    color: { control: { type: 'select' }, options: [undefined, ...colors] }
  },
  args: {
    color: undefined
  }
} satisfies Meta<typeof Logomark>;

export default meta;
type Story = StoryObj<typeof meta>;

/** In the brand's own colour, Panel white. */
export const Default = {} satisfies Story;

/** Taking the accent of the page being edited. Pick another colour to see it fade across. */
export const PageAccent = { args: { color: '#59ff9c' } } satisfies Story;
