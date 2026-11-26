import type { Catalogue } from '../palette/choices.js';
import type { Layout, Page, TokenValues } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';

import { PageProperties } from './PageProperties.js';
import { WidgetProperties } from './WidgetProperties.js';

export type PropertiesPanelProps = {
  catalogue: Catalogue;
  documentTokens: TokenValues | undefined;
  layout: Layout;
  /** `merge` names a run of typing in one field; changes with the same one are one undo step (0023). */
  onChange: (page: Page, merge?: string) => void;
  onSelect: (id: string | null) => void;
  page: Page;
  selectedId: string | null;
};

/**
 * The properties panel (0023): the selected widget's, generated from its manifest, or the page's
 * while nothing is selected. Fits any box, as a sidebar or in a sheet (0008).
 */
export function PropertiesPanel({ selectedId, ...props }: PropertiesPanelProps) {
  const { layout, onChange, page } = props;
  const widget = page.widgets.find(candidate => candidate.id === selectedId);
  const manifest = widget ? widgetManifests[widget.type] : undefined;

  return widget && manifest ? (
    <WidgetProperties {...props} key={widget.id} manifest={manifest} widget={widget} />
  ) : (
    <PageProperties key={page.id} layout={layout} onChange={onChange} page={page} />
  );
}
