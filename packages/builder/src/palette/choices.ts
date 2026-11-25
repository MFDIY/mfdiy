import type { WidgetManifest } from '@mfdiy/instruments';
import type { ActionDefinition, SignalDefinition, WidgetInstance } from '@mfdiy/schema';

/** What the game offers to build with. */
export type Catalogue = {
  signals: readonly SignalDefinition[];
  actions: readonly ActionDefinition[];
};

/** A widget to add: everything except its id and place. */
export type NewWidget = Pick<WidgetInstance, 'type' | 'bindings' | 'action'>;

/** Something a widget can show or do. */
export type Choice = {
  id: string;
  label: string;
  group: string;
  manifest: WidgetManifest;
  /** Undefined for an action. */
  signal: SignalDefinition | undefined;
  widget: NewWidget;
};

/**
 * What a new widget can show or do: signals for its first input or, without inputs, actions. The
 * rest is up to its properties. Undefined for a widget that shows and does nothing of the sort.
 */
export function listChoices(manifest: WidgetManifest, catalogue: Catalogue): Choice[] | undefined {
  const { type, inputs, actionable } = manifest;
  const [input] = Object.entries(inputs);

  if (input) {
    const [name, { accepts }] = input;

    return catalogue.signals
      .filter(signal => accepts.includes(signal.kind))
      .map(signal => ({
        id: `${type} ${signal.id}`,
        label: signal.label,
        group: signal.group,
        manifest,
        signal,
        widget: { type, bindings: { [name]: { signal: signal.id } } }
      }));
  }

  return actionable
    ? catalogue.actions.map(({ id, label, group }) => ({
        id: `${type} ${id}`,
        label,
        group,
        manifest,
        signal: undefined,
        widget: { type, action: id }
      }))
    : undefined;
}

function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Every word searched for must start a word in the text: "light" doesn't find "Flight". */
export function matches(text: string, search: string): boolean {
  const words = wordsOf(text);

  return wordsOf(search).every(start => words.some(word => word.startsWith(start)));
}

/** Searches labels, groups and widget names. Labels that start with the search come first. */
export function searchChoices(choices: readonly Choice[], search: string): Choice[] {
  const start = search.trim().toLowerCase();
  const startsWith = (choice: Choice) => choice.label.toLowerCase().startsWith(start);

  return choices
    .filter(({ label, group, manifest }) => matches(`${label} ${group} ${manifest.label}`, search))
    .sort((a, b) => Number(startsWith(b)) - Number(startsWith(a)));
}
