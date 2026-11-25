import type { WidgetManifest } from '@mfdiy/instruments';
import type { ActionDefinition, SignalDefinition, WidgetInstance } from '@mfdiy/schema';

/** What the game offers to build with. */
export type Catalogue = {
  signals: readonly SignalDefinition[];
  actions: readonly ActionDefinition[];
};

/** A widget to add: everything except its id and place. */
export type NewWidget = Pick<WidgetInstance, 'type' | 'bindings' | 'action'>;

type Choice = { id: string; label: string; group: string; widget: NewWidget };

export type ChoiceGroup = { name: string; choices: Choice[] };

/**
 * What a new widget can show or do: signals for its first input or, without inputs, actions. The
 * rest is up to its properties. Undefined if there is nothing to choose.
 */
export function listChoices({ type, inputs, actionable }: WidgetManifest, catalogue: Catalogue): Choice[] | undefined {
  const [input] = Object.entries(inputs);

  if (input) {
    const [name, { accepts }] = input;

    return catalogue.signals
      .filter(signal => accepts.includes(signal.kind))
      .map(({ id, label, group }) => ({ id, label, group, widget: { type, bindings: { [name]: { signal: id } } } }));
  }

  return actionable
    ? catalogue.actions.map(({ id, label, group }) => ({ id, label, group, widget: { type, action: id } }))
    : undefined;
}

/** Every word must appear in the label or group. Groups and choices keep the catalogue's order. */
export function groupChoices(choices: readonly Choice[], search: string): ChoiceGroup[] {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const groups = new Map<string, Choice[]>();

  for (const choice of choices) {
    const text = `${choice.group} ${choice.label}`.toLowerCase();

    if (words.every(word => text.includes(word))) {
      groups.set(choice.group, [...(groups.get(choice.group) ?? []), choice]);
    }
  }

  return [...groups].map(([name, members]) => ({ name, choices: members }));
}
