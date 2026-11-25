import type { Command } from './Command.js';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { Button } from '../Button/Button.js';

import { CommandPalette, type CommandPaletteProps } from './CommandPalette.js';

const commands: Command[] = ['Bar', 'Button', 'Light', 'Readout'].map(label => ({
  id: label,
  label,
  entity: 'Widget',
  description: 'Lorem ipsum',
  onSelect: () => console.log(label)
}));

function Demo(props: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open command palette</Button>
      <CommandPalette
        {...props}
        activeIndex={activeIndex}
        commands={commands.filter(command => command.label.toLowerCase().includes(query.toLowerCase()))}
        isOpen={isOpen}
        onActiveIndexChange={setActiveIndex}
        onClose={() => {
          setIsOpen(false);
          setQuery('');
        }}
        onQueryChange={setQuery}
        query={query}
      />
    </>
  );
}

const meta = {
  title: 'Components / CommandPalette',
  component: CommandPalette,
  args: {
    activeIndex: null,
    commands,
    emptyText: 'Nothing found.',
    focusSearch: true,
    isOpen: true,
    label: 'Add a widget',
    onActiveIndexChange: () => undefined,
    onClose: () => undefined,
    onQueryChange: () => undefined,
    placeholder: 'Search',
    query: ''
  },
  render: args => <Demo {...args} />
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

/** Opened by touch: the search field isn't focused, so no keyboard covers the list. */
export const Touch = { args: { focusSearch: false } } satisfies Story;
