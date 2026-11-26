import type { TokenValues } from '@mfdiy/schema';
import type { SearchListGroup, SearchListItem, SearchListProps } from '@mfdiy/ui/components';

import { widgetManifests, type WidgetManifest } from '@mfdiy/instruments';
import { useCyclingPlaceholder } from '@mfdiy/ui/hooks';
import { useState } from 'react';

import { WidgetPreview } from './WidgetPreview.js';
import { listChoices, matches, searchChoices, type Catalogue, type Choice, type NewWidget } from './choices.js';

/** What a row in the library stands for. */
export type LibraryEntry = {
  manifest: WidgetManifest;
  /** The widget to add, if the row is a finished choice; undefined if it still needs its data. */
  widget: NewWidget | undefined;
};

type WidgetLibraryOptions = {
  catalogue: Catalogue;
  documentTokens: TokenValues | undefined;
  pageTokens: TokenValues | undefined;
};

export type WidgetLibrary = {
  /** Everything the library's SearchList needs but what to do with a chosen row. */
  listProps: Omit<SearchListProps, 'onSelect' | 'onItemPointerDown' | 'draggable' | 'focusSearch'>;
  /** What a row stands for. */
  entry: (id: string) => LibraryEntry | undefined;
  /** Moves on to a widget's data, or back to the widgets with null. */
  pick: (manifest: WidgetManifest | null) => void;
  /** The widget whose data is listed, if any. */
  picked: WidgetManifest | null;
  /** The type of widget under the pointer or keyboard, for the canvas to preview where it would go. */
  highlightedType: string | null;
  /** Back to the widgets, with an empty search. */
  reset: () => void;
};

const manifests = Object.values(widgetManifests).sort((a, b) => a.label.localeCompare(b.label));

/** A few distinct names, lower case, to suggest what can be searched for. */
function suggestions(names: readonly string[], count = 4): string[] {
  return [...new Set(names.map(name => name.toLowerCase()))].slice(0, count);
}

/** Alternates two lists: data first, so the search reads as more than a list of widgets. */
function interleave(first: readonly string[], second: readonly string[]): string[] {
  return Array.from({ length: Math.max(first.length, second.length) }, (_, index) => [first[index], second[index]])
    .flat()
    .filter((term): term is string => term !== undefined);
}

/**
 * The widget library (0006, 0008): widgets first, then what the picked one shows or does. One search
 * finds both, so "hyd" offers a hydrogen fuel bar straight away. Its prompts give real examples from
 * the game's catalogue, so it's clear what can be looked for.
 */
export function useWidgetLibrary({ catalogue, documentTokens, pageTokens }: WidgetLibraryOptions): WidgetLibrary {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<WidgetManifest | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const tokens = { documentTokens, pageTokens };
  const searching = query.trim() !== '';
  const entries = new Map<string, LibraryEntry>();

  function pick(manifest: WidgetManifest | null) {
    setPicked(manifest);
    setQuery('');
    setHighlighted(null);
  }

  function widgetItem(manifest: WidgetManifest): SearchListItem {
    const hasChoices = listChoices(manifest, catalogue) !== undefined;
    const id = `widget ${manifest.type}`;

    entries.set(id, { manifest, widget: hasChoices ? undefined : { type: manifest.type } });

    return {
      id,
      label: manifest.label,
      description: manifest.description,
      preview: <WidgetPreview {...tokens} manifest={manifest} />,
      opens: hasChoices
    };
  }

  function choiceItem({ id, label, manifest, signal, widget }: Choice): SearchListItem {
    entries.set(id, { manifest, widget });

    return {
      id,
      label,
      description: picked ? undefined : manifest.label,
      preview: <WidgetPreview {...tokens} label={label} manifest={manifest} signal={signal} />
    };
  }

  function byGroup(choices: readonly Choice[]): SearchListGroup[] {
    const groups = new Map<string, Choice[]>();

    for (const choice of choices) {
      groups.set(choice.group, [...(groups.get(choice.group) ?? []), choice]);
    }

    return [...groups].map(([label, inGroup]) => ({ label, items: inGroup.map(choiceItem) }));
  }

  function listGroups(): SearchListGroup[] {
    if (picked) {
      return byGroup(searchChoices(listChoices(picked, catalogue) ?? [], query));
    }

    if (!searching) {
      return [{ items: manifests.map(widgetItem) }];
    }

    const widgets = manifests.filter(manifest => matches(manifest.label, query)).map(widgetItem);
    const data = searchChoices(
      manifests.flatMap(manifest => listChoices(manifest, catalogue) ?? []),
      query
    ).map(choiceItem);

    return [
      ...(widgets.length > 0 ? [{ label: 'Widgets', items: widgets }] : []),
      ...(data.length > 0 ? [{ label: 'Data', items: data }] : [])
    ];
  }

  function prompts() {
    if (!picked) {
      return {
        label: 'Widgets and data',
        terms: interleave(
          suggestions(
            catalogue.signals.map(signal => signal.label),
            3
          ),
          suggestions(
            manifests.map(manifest => manifest.label),
            2
          )
        )
      };
    }

    const choices = listChoices(picked, catalogue) ?? [];
    const showsData = Object.keys(picked.inputs).length > 0;

    return {
      label: `What this ${picked.label.toLowerCase()} ${showsData ? 'shows' : 'does'}`,
      terms: suggestions(choices.map(choice => choice.label))
    };
  }

  const groups = listGroups();
  const { label, terms } = prompts();
  const cycling = useCyclingPlaceholder(!searching, 'Search ', terms);
  const placeholder = terms.length > 0 ? cycling : 'Search';

  return {
    listProps: {
      back: picked ? { label: picked.label, onBack: () => pick(null) } : undefined,
      emptyText: searching ? 'Nothing found.' : 'Nothing to connect this to. Is the bridge running?',
      groups,
      label,
      onHighlight: setHighlighted,
      onQueryChange: setQuery,
      placeholder,
      query
    },
    entry: id => entries.get(id),
    pick,
    picked,
    highlightedType: highlighted ? (entries.get(highlighted)?.manifest.type ?? null) : null,
    reset: () => pick(null)
  };
}
