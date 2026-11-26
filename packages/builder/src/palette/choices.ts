import type { ActionDefinition, SignalDefinition } from '@mfdiy/schema';

/** What the game offers to build with. */
export type Catalogue = {
  signals: readonly SignalDefinition[];
  actions: readonly ActionDefinition[];
};

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
