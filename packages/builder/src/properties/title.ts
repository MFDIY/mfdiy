import type { Catalogue } from '../palette/choices.js';
import type { Page, WidgetInstance } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';
import { gameActionOf, pageActionOf } from '@mfdiy/schema';

/** A page a page button can show (0018). */
export type PageChoice = Pick<Page, 'id' | 'name'>;

/** What a widget is called on screen: its label, or what it shows or does, or its type. */
export function widgetTitle(widget: WidgetInstance, catalogue: Catalogue, pages: readonly PageChoice[] = []): string {
  const label = widget.options?.['label'];
  const signal = Object.values(widget.bindings ?? {})[0]?.signal;

  return (
    (typeof label === 'string' && label) ||
    catalogue.signals.find(candidate => candidate.id === signal)?.label ||
    catalogue.actions.find(candidate => candidate.id === gameActionOf(widget))?.label ||
    pages.find(candidate => candidate.id === pageActionOf(widget))?.name ||
    widgetManifests[widget.type]?.label ||
    widget.type
  );
}

/** The properties panel's title: the selected widget's, or the page's. */
export function propertiesTitle(
  page: Page,
  selectedId: string | null,
  catalogue: Catalogue,
  pages: readonly PageChoice[] = []
): string {
  const widget = page.widgets.find(candidate => candidate.id === selectedId);

  return widget ? widgetTitle(widget, catalogue, pages) : 'Page';
}
