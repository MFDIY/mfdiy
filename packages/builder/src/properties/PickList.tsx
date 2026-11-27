import type { ReactNode } from 'react';

import { SearchList, usePanelForm, type SearchListGroup } from '@mfdiy/ui/components';
import { useState } from 'react';

import { matches } from '../palette/choices.js';

export type PickItem = {
  description?: string | undefined;
  /** Groups items under a heading; items without one come first. */
  group?: string | undefined;
  id: string;
  label: string;
  preview?: ReactNode | undefined;
};

type PickListProps = {
  /** Names the way back, e.g. the widget's name. */
  back: string;
  emptyText: string;
  items: readonly PickItem[];
  label: string;
  onBack: () => void;
  onPick: (id: string) => void;
};

function byGroup(items: readonly PickItem[]): SearchListGroup[] {
  const groups = new Map<string | undefined, PickItem[]>();

  for (const item of items) {
    groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  }

  return [...groups].map(([label, inGroup]) => ({ label, items: inGroup }));
}

/** A searchable list for a side task in the panel (0008), with Back to return to the properties. */
export function PickList({ back, emptyText, items, label, onBack, onPick }: PickListProps) {
  const [query, setQuery] = useState('');
  const sidebar = usePanelForm() === 'sidebars';
  const found = items.filter(item => matches(`${item.label} ${item.group ?? ''}`, query));

  return (
    <SearchList
      back={{ label: back, onBack }}
      emptyText={query.trim() === '' ? emptyText : 'Nothing found.'}
      focusSearch={sidebar}
      groups={byGroup(found)}
      label={label}
      onQueryChange={setQuery}
      onSelect={onPick}
      placeholder='Search'
      query={query}
    />
  );
}
