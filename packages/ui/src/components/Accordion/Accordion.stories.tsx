import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent } from 'storybook/test';

import { Placeholder } from '../Placeholder/Placeholder.js';

import { Accordion } from './Accordion.js';

const items = [
  { content: <Placeholder height={80} />, label: 'Front', summary: 'Shield front · low 25 / 10 %', value: 'front' },
  { content: <Placeholder height={80} />, label: 'Rear', summary: 'Shield rear · low 25 / 10 %', value: 'rear' },
  { content: <Placeholder height={80} />, invalid: true, label: 'Left', summary: 'Not connected', value: 'left' }
];

const meta = {
  title: 'Components / Accordion',
  component: Accordion,
  argTypes: {
    defaultOpen: { control: false },
    items: { control: false }
  },
  args: {
    defaultOpen: undefined,
    items
  },
  decorators: [
    Story => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All closed: each row names its item and summarises what's inside. */
export const Default = {} satisfies Story;

/** One open from the start, as a widget's only input is (0023). */
export const OneOpen = { args: { defaultOpen: ['front'] } } satisfies Story;

/** Only one is open at a time: opening another closes the first. */
export const OpeningAnother = {
  tags: ['!dev', '!visual'],
  args: { defaultOpen: ['front'] },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: /^Rear/ }));
    await expect(screen.getByRole('button', { name: /^Front/ })).toHaveAttribute('aria-expanded', 'false');
    await expect(screen.getByRole('button', { name: /^Rear/ })).toHaveAttribute('aria-expanded', 'true');
  }
} satisfies Story;
