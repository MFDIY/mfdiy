import type { Page } from './document.js';
import type { SignalDefinition } from './signals.js';

/**
 * Signals the MFD provides itself, rather than the game, start with this. Game adapters must not
 * use it.
 */
export const MFD_SIGNAL_PREFIX = 'mfd.';

const PAGE_SIGNAL_PREFIX = `${MFD_SIGNAL_PREFIX}page.`;

/** The signal that's on while a page is shown, e.g. to light a page button (0018). */
export function pageSignalId(pageId: string): string {
  return `${PAGE_SIGNAL_PREFIX}${pageId}`;
}

/** The page a "page shown" signal is about, if it's one. */
export function pageOfSignal(signalId: string): string | undefined {
  return signalId.startsWith(PAGE_SIGNAL_PREFIX) ? signalId.slice(PAGE_SIGNAL_PREFIX.length) : undefined;
}

/** One on/off signal per page, on while it's shown, named after the page (0018). */
export function pageSignals(pages: readonly Pick<Page, 'id' | 'name'>[]): SignalDefinition[] {
  return pages.map(page => ({ id: pageSignalId(page.id), label: page.name, group: 'Pages', kind: 'boolean' }));
}
