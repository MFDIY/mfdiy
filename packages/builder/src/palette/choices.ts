import { pageSignals, type ActionDefinition, type Page, type SignalDefinition } from '@mfdiy/schema';

/** What the game offers to build with. */
export type Catalogue = {
  signals: readonly SignalDefinition[];
  actions: readonly ActionDefinition[];
};

/** The game's signals and actions, and the signals the MFD provides: one per page, on while it's shown (0018). */
export function withPageSignals(catalogue: Catalogue, pages: readonly Pick<Page, 'id' | 'name'>[]): Catalogue {
  return { ...catalogue, signals: [...catalogue.signals, ...pageSignals(pages)] };
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
