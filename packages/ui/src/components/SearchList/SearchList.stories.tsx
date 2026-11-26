import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { Placeholder } from '../Placeholder/Placeholder.js';

import { SearchList, type SearchListGroup } from './SearchList.js';

const widgets: SearchListGroup[] = [
  {
    items: [
      {
        id: 'bar',
        label: 'Bar',
        description: 'A linear gauge for a number signal.',
        preview: <Placeholder />,
        opens: true
      },
      { id: 'button', label: 'Button', description: 'Triggers a game action.', preview: <Placeholder />, opens: true },
      { id: 'light', label: 'Light', description: 'An annunciator light.', preview: <Placeholder />, opens: true }
    ]
  }
];

const data: SearchListGroup[] = [
  {
    label: 'Shields',
    items: [
      { id: 'shields.front', label: 'Front' },
      { id: 'shields.rear', label: 'Rear' }
    ]
  },
  {
    label: 'Fuel',
    items: [
      { id: 'fuel.hydrogen', label: 'Hydrogen' },
      { id: 'fuel.quantum', label: 'Quantum' }
    ]
  }
];

/**
 * SearchList never filters by itself and its query is controlled, so the story searches and keeps
 * the query, as its owner would. Keyed on the controls, so changing one starts it over.
 */
function SearchableList({
  groups,
  query: initialQuery,
  onQueryChange,
  ...restProps
}: ComponentProps<typeof SearchList>) {
  const [query, setQuery] = useState(initialQuery);
  const search = query.trim().toLowerCase();
  const found = groups
    .map(group => ({ ...group, items: group.items.filter(item => item.label.toLowerCase().includes(search)) }))
    .filter(group => group.items.length > 0);

  return (
    <div style={{ height: '420px', width: '320px' }}>
      <SearchList
        {...restProps}
        groups={found}
        onQueryChange={next => {
          setQuery(next);
          onQueryChange(next);
        }}
        query={query}
      />
    </div>
  );
}

const meta = {
  title: 'Components / SearchList',
  component: SearchList,
  argTypes: {
    back: { control: false },
    emptyText: { control: { type: 'text' } },
    focusSearch: { control: { type: 'boolean' } },
    groups: { control: false },
    label: { control: { type: 'text' } },
    placeholder: { control: { type: 'text' } },
    query: { control: { type: 'text' } }
  },
  args: {
    back: undefined,
    emptyText: 'Nothing found.',
    focusSearch: false,
    groups: [],
    label: 'Search',
    onHighlight: fn(),
    onItemPointerDown: undefined,
    onQueryChange: fn(),
    onSelect: fn(),
    placeholder: 'Search',
    query: ''
  },
  render: args => <SearchableList {...args} key={`${args.query}-${args.focusSearch}`} />
} satisfies Meta<typeof SearchList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop at its default: nothing to list. */
export const Default = {} satisfies Story;

/** Items that open more choices, with previews. */
export const Widgets = {
  args: { groups: widgets, label: 'Widgets', placeholder: 'Widgets or data, e.g. fuel' }
} satisfies Story;

/** The second step: grouped items, and a way back. */
export const WithBack = {
  args: {
    back: { label: 'Bar', onBack: fn() },
    groups: data,
    label: 'Data for this bar',
    placeholder: 'e.g. shields or fuel'
  }
} satisfies Story;

export const Searching = { args: { groups: data, query: 'h' } } satisfies Story;

/** Arrow keys move through the list; Enter chooses. */
export const KeyboardChooses = {
  tags: ['!dev'],
  args: { groups: data, focusSearch: true },
  play: async ({ args }) => {
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(args.onSelect).toHaveBeenCalledWith('shields.rear');
  }
} satisfies Story;

/** Typing searches; what's typed stays in the field. */
export const TypingSearches = {
  tags: ['!dev'],
  args: { groups: data },
  play: async () => {
    await userEvent.type(screen.getByRole('combobox'), 'quan');
    await expect(screen.getByRole('combobox')).toHaveValue('quan');
    await expect(screen.getByRole('option', { name: 'Quantum' })).toBeInTheDocument();
    await expect(screen.queryByRole('option', { name: 'Front' })).not.toBeInTheDocument();
  }
} satisfies Story;
