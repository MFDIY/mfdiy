import type { PageChoice } from './title.js';
import type { Catalogue } from '../palette/choices.js';
import type { Layout, Page, TokenValues } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';

import { PageProperties, type PagePropertiesProps } from './PageProperties.js';
import { ProfileProperties, type ProfileSettings } from './ProfileProperties.js';
import { WidgetProperties } from './WidgetProperties.js';

export type PropertiesPanelProps = Pick<PagePropertiesProps, 'onDelete' | 'onDuplicate'> & {
  catalogue: Catalogue;
  documentTokens: TokenValues | undefined;
  /** Focuses the page's name field while nothing is selected, e.g. on a page just duplicated (0023). */
  focusPageName?: boolean | undefined;
  layout: Layout;
  /** `merge` names a run of typing in one field; changes with the same one are one undo step (0023). */
  onChange: (page: Page, merge?: string) => void;
  /** Changes the profile's settings; see `profile`. */
  onProfileChange?: ((profile: ProfileSettings, merge?: string) => void) | undefined;
  onSelect: (id: string | null) => void;
  page: Page;
  /** The profile's pages, which a page button can show (0018). */
  pages: readonly PageChoice[];
  /** The profile's settings, shown instead of the page's while nothing is selected, with `onProfileChange`. */
  profile?: ProfileSettings | undefined;
  selectedId: string | null;
  /** No page button leads to the page (0026). */
  unreachable?: boolean | undefined;
};

/**
 * The properties panel (0023): the selected widget's, generated from its manifest, or the page's
 * while nothing is selected, or the profile's after its label was pressed (0006). Fits any box, as a sidebar or in a sheet (0008).
 */
export function PropertiesPanel({
  focusPageName,
  onDelete,
  onDuplicate,
  onProfileChange,
  profile,
  selectedId,
  unreachable,
  ...props
}: PropertiesPanelProps) {
  const { layout, onChange, page } = props;
  const widget = page.widgets.find(candidate => candidate.id === selectedId);
  const manifest = widget ? widgetManifests[widget.type] : undefined;

  if (!widget && profile && onProfileChange) {
    return <ProfileProperties onChange={onProfileChange} profile={profile} />;
  }

  return widget && manifest ? (
    <WidgetProperties {...props} key={widget.id} manifest={manifest} widget={widget} />
  ) : (
    <PageProperties
      focusName={focusPageName}
      key={page.id}
      layout={layout}
      onChange={onChange}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      page={page}
      unreachable={unreachable}
    />
  );
}
