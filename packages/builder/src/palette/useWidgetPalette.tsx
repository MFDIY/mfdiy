import type { TokenValues } from '@mfdiy/schema';
import type { Command, CommandPaletteProps } from '@mfdiy/ui/components';

import { widgetManifests, type WidgetManifest } from '@mfdiy/instruments';
import { useState } from 'react';

import { WidgetPreview } from './WidgetPreview.js';
import { listChoices, matches, searchChoices, type Catalogue, type Choice, type NewWidget } from './choices.js';

type WidgetPaletteOptions = {
  catalogue: Catalogue;
  documentTokens: TokenValues | undefined;
  pageTokens: TokenValues | undefined;
  onAdd: (widget: NewWidget) => void;
};

type WidgetPalette = {
  /** Starts afresh, for the next time it opens. */
  reset: () => void;
  /** The type of widget being considered, if any. */
  type: string | null;
  paletteProps: Omit<CommandPaletteProps, 'focusSearch' | 'isOpen' | 'onClose'>;
};

/** A command and the type of widget it's about. */
type WidgetCommand = Command & { type: string };

const manifests = Object.values(widgetManifests).sort((a, b) => a.label.localeCompare(b.label));

/**
 * The command palette that adds a widget: pick one, then what it shows or does. Searching finds both
 * at once. A widget that can be connected to something is never added without (0006).
 */
export function useWidgetPalette({
  catalogue,
  documentTokens,
  pageTokens,
  onAdd
}: WidgetPaletteOptions): WidgetPalette {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  /** The widget whose choices are listed. */
  const [picked, setPicked] = useState<WidgetManifest | null>(null);

  const tokens = { documentTokens, pageTokens };
  const searching = query.trim() !== '';

  function pick(manifest: WidgetManifest | null) {
    setPicked(manifest);
    setQuery('');
    setActiveIndex(null);
  }

  function widgetCommand(manifest: WidgetManifest): WidgetCommand {
    const hasChoices = listChoices(manifest, catalogue) !== undefined;

    return {
      id: manifest.type,
      type: manifest.type,
      label: manifest.label,
      description: manifest.description,
      preview: <WidgetPreview {...tokens} manifest={manifest} />,
      staysOpen: hasChoices,
      onSelect: () => (hasChoices ? pick(manifest) : onAdd({ type: manifest.type }))
    };
  }

  function choiceCommand({ id, label, group, manifest, signal, widget }: Choice): WidgetCommand {
    return {
      id,
      type: manifest.type,
      label,
      // Within one widget's choices, its name says nothing new.
      entity: picked ? undefined : manifest.label,
      description: group,
      preview: <WidgetPreview {...tokens} label={label} manifest={manifest} signal={signal} />,
      onSelect: () => onAdd(widget)
    };
  }

  function listCommands(): WidgetCommand[] {
    if (picked) {
      return searchChoices(listChoices(picked, catalogue) ?? [], query).map(choiceCommand);
    }

    if (!searching) {
      return manifests.map(widgetCommand);
    }

    const choices = manifests.flatMap(manifest => listChoices(manifest, catalogue) ?? []);

    return [
      ...manifests.filter(manifest => matches(manifest.label, query)).map(widgetCommand),
      ...searchChoices(choices, query).map(choiceCommand)
    ];
  }

  const commands = listCommands();
  const active = activeIndex === null ? undefined : commands[activeIndex];

  return {
    reset: () => pick(null),
    type: active?.type ?? picked?.type ?? null,
    paletteProps: {
      activeIndex: active ? activeIndex : null,
      commands,
      emptyText: searching ? 'Nothing found.' : 'Nothing to connect this to. Is the bridge running?',
      label: 'Add a widget',
      onActiveIndexChange: setActiveIndex,
      onBack: picked ? () => pick(null) : undefined,
      onQueryChange: setQuery,
      placeholder: picked ? `Search for this ${picked.label.toLowerCase()}…` : 'Search widgets and data…',
      query
    }
  };
}
