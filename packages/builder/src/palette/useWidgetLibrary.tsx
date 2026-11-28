import type { TokenValues } from '@mfdiy/schema';
import type { SearchListItem, SearchListProps } from '@mfdiy/ui/components';

import { widgetManifests, type WidgetManifest } from '@mfdiy/instruments';
import { useCyclingPlaceholder } from '@mfdiy/ui/hooks';
import { useState } from 'react';

import { WidgetPreview } from './WidgetPreview.js';
import { matches } from './choices.js';

type WidgetLibraryOptions = {
  documentTokens: TokenValues | undefined;
  extra?: readonly WidgetManifest[] | undefined;
  pageTokens: TokenValues | undefined;
};

export type WidgetLibrary = {
  /** Everything the library's SearchList needs but what to do with a chosen row. */
  listProps: Omit<SearchListProps, 'draggable' | 'focusSearch' | 'onItemPointerDown' | 'onSelect'>;
  /** The widget type a row stands for. */
  manifest: (id: string) => WidgetManifest | undefined;
  /** The type of widget under the pointer or keyboard, for the canvas to preview where it would go. */
  highlightedType: string | null;
  /** Back to an empty search. */
  reset: () => void;
};

const widgets = Object.values(widgetManifests);

const rowId = (manifest: WidgetManifest) => `widget ${manifest.type}`;

/**
 * The widget library (0006, 0008): widget types, searchable. A widget is added as a type, and
 * what it shows or does is chosen in its properties (0023), since a widget may take several signals.
 */
export function useWidgetLibrary({ documentTokens, extra = [], pageTokens }: WidgetLibraryOptions): WidgetLibrary {
  const manifests = [...widgets, ...extra].sort((a, b) => a.label.localeCompare(b.label));
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const searching = query.trim() !== '';
  const items = manifests
    .filter(manifest => matches(manifest.label, query))
    .map((manifest): SearchListItem => ({
      id: rowId(manifest),
      label: manifest.label,
      description: manifest.description,
      preview: <WidgetPreview documentTokens={documentTokens} manifest={manifest} pageTokens={pageTokens} />
    }));
  const terms = manifests.map(manifest => manifest.label.toLowerCase());
  const cycling = useCyclingPlaceholder(!searching, 'Search ', terms);

  return {
    listProps: {
      emptyText: searching ? 'Nothing found.' : 'No widgets.',
      groups: items.length > 0 ? [{ items }] : [],
      label: 'Widgets',
      onHighlight: setHighlighted,
      onQueryChange: setQuery,
      placeholder: terms.length > 0 ? cycling : 'Search',
      query
    },
    manifest: id => manifests.find(manifest => rowId(manifest) === id),
    highlightedType: manifests.find(manifest => rowId(manifest) === highlighted)?.type ?? null,
    reset: () => {
      setQuery('');
      setHighlighted(null);
    }
  };
}
