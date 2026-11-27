import type { Meta, StoryObj } from '@storybook/react-vite';

import { Accordion } from '../Accordion/Accordion.js';
import { Box } from '../Box/Box.js';
import { Group } from '../Group/Group.js';
import { Placeholder } from '../Placeholder/Placeholder.js';

import { Bleed, bleedSpacings } from './Bleed.js';

const meta = {
  title: 'Components / Bleed',
  component: Bleed,
  argTypes: {
    bottom: { control: { type: 'select' }, options: bleedSpacings },
    children: { control: false },
    horizontal: { control: { type: 'select' }, options: bleedSpacings },
    top: { control: { type: 'select' }, options: bleedSpacings }
  },
  args: {
    bottom: undefined,
    children: <Placeholder height={60} />,
    horizontal: undefined,
    top: undefined
  },
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Box borderColor='line' borderStyle='dashed' borderWidth='hairline' padding='5x'>
          <Story />
        </Box>
      </div>
    )
  ]
} satisfies Meta<typeof Bleed>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Without amounts, it stays inside the padding. */
export const Default = {} satisfies Story;

/** Reaching to the sides of the dashed frame, over its padding. */
export const Horizontal = { args: { horizontal: '5x' } } satisfies Story;

/** A `Group` hugging its accordion: the rows reach the frame, and its text stays where it was. */
export const GroupAroundAnAccordion = {
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ],
  render: () => (
    <Group title='Data'>
      <Bleed bottom='3x' horizontal='3x'>
        <Accordion
          defaultOpen={['left']}
          items={[
            { content: <Placeholder height={60} />, label: 'Left', summary: 'Shield left', value: 'left' },
            { content: <Placeholder height={60} />, label: 'Right', summary: 'Shield right', value: 'right' },
            { content: <Placeholder height={60} />, label: 'Top', summary: 'Shield top', value: 'top' }
          ]}
        />
      </Bleed>
    </Group>
  )
} satisfies Story;
