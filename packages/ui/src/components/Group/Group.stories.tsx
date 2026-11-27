import type { Meta, StoryObj } from '@storybook/react-vite';

import { Accordion } from '../Accordion/Accordion.js';
import { Bleed } from '../Bleed/Bleed.js';
import { Placeholder } from '../Placeholder/Placeholder.js';

import { Group } from './Group.js';

const meta = {
  title: 'Components / Group',
  component: Group,
  argTypes: {
    children: { control: false },
    description: { control: { type: 'text' } },
    title: { control: { type: 'text' } }
  },
  args: {
    children: <Placeholder height={80} />,
    description: undefined,
    title: 'Data'
  },
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Group>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A titled frame; the title sits in its top edge. */
export const Default = {} satisfies Story;

/** A hint about the whole group sits in a toggletip by its title. */
export const WithDescription = {
  args: { description: 'Where the widget gets its values from.' }
} satisfies Story;

/** Around a widget's inputs, each an accordion item (0023), which reach its frame through `Bleed`. */
export const AroundAnAccordion = {
  args: {
    children: (
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
    )
  }
} satisfies Story;
