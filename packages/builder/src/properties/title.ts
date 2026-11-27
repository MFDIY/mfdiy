import type { Catalogue } from '../palette/choices.js';
import type { Page, WidgetInstance } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';

/** What a widget is called on screen: its label, or what it shows or does, or its type. */
export function widgetTitle(widget: WidgetInstance, catalogue: Catalogue): string {
  const label = widget.options?.['label'];
  const signal = Object.values(widget.bindings ?? {})[0]?.signal;

  return (
    (typeof label === 'string' && label) ||
    catalogue.signals.find(candidate => candidate.id === signal)?.label ||
    catalogue.actions.find(candidate => candidate.id === widget.action)?.label ||
    widgetManifests[widget.type]?.label ||
    widget.type
  );
}

/** The properties panel's title: the selected widget's, or the page's. */
export function propertiesTitle(page: Page, selectedId: string | null, catalogue: Catalogue): string {
  const widget = page.widgets.find(candidate => candidate.id === selectedId);

  return widget ? widgetTitle(widget, catalogue) : 'Page';
}
