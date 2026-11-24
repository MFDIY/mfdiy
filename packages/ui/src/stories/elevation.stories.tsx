import type { Meta, StoryObj } from '@storybook/react-vite';

import { Surface } from '../components/Surface/Surface.js';
import { Text } from '../components/Text/Text.js';

const meta = {
  title: 'Docs / Elevation',
  component: Surface,
  args: {
    borderRadius: '3x',
    children: 'Lorem ipsum',
    display: 'flex',
    elevation: 'base',
    justifyContent: 'center',
    paddingBlock: '5x'
  }
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Base = {
  args: {
    children: <Text>Base</Text>,
    elevation: 'base'
  }
} satisfies Story;

export const Depressed = {
  args: {
    children: <Text>Depressed</Text>,
    elevation: 'depressed'
  }
} satisfies Story;

export const Raised = {
  args: {
    children: <Text>Raised</Text>,
    elevation: 'raised'
  }
} satisfies Story;

export const Floating = {
  args: {
    children: <Text>Floating</Text>,
    elevation: 'floating'
  }
} satisfies Story;
