import type { Meta, StoryObj } from '@storybook/react-vite';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';
import { mediaAndPseudoConditionalProperties } from '../../styles/sprinkles.css.js';
import { Text } from '../Text/Text.js';

import { Surface, elevations } from './Surface.js';

const meta = {
  title: 'Components / Surface',
  component: Surface,
  argTypes: {
    children: { control: false },
    elevation: createArgTypeFromConditionalStyleProp(elevations, mediaAndPseudoConditionalProperties.conditions)
  },
  args: {
    children: <Text variant='body'>On a surface</Text>,
    elevation: 'base',
    padding: '4x'
  }
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A background for a group of things. Flat (0022): elevation is only a step in tone. */
export const Default = {} satisfies Story;

export const Raised = { args: { elevation: 'raised' } } satisfies Story;
