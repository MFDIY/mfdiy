/** Whether the platform's shortcuts use ⌘ rather than Ctrl, as on a Mac or an iPad. */
export const usesCommandKey = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

/** How a shortcut with the platform's modifier is written in a menu, e.g. "⌘C" or "Ctrl+C". */
export function modifierShortcut(key: string): string {
  return usesCommandKey ? `⌘${key}` : `Ctrl+${key}`;
}

/** Whether a key press is the platform's modifier with `key`, and nothing else. */
export function isModifierShortcut(event: KeyboardEvent, key: string): boolean {
  const modifier = usesCommandKey ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;

  return modifier && !event.altKey && !event.shiftKey && event.key.toLowerCase() === key.toLowerCase();
}
