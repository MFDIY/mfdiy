import type { WidgetManifest } from '@mfdiy/instruments';
import type { Layout, Page, SharedSubgrid, WidgetInstance } from '@mfdiy/schema';
import type { ReactNode } from 'react';

import { LayoutArea, LayoutGrid } from '@mfdiy/instruments';
import { areasEqual, subgridArea } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';

import * as styles from '../canvas/Canvas.css.js';

/** The library's row for a shared subgrid, and the type it has while it stands on a page as one widget (0026). */
export const SUBGRID_TYPE = 'shared-subgrid';

const PREFIX = `${SUBGRID_TYPE}:`;

/** The id a shared subgrid has while it stands on a page as one widget. */
export function subgridWidgetId(id: string): string {
  return `${PREFIX}${id}`;
}

/** The shared subgrid a widget id on the page stands for, if it stands for one. */
export function subgridIdOf(widgetId: string | null): string | undefined {
  return widgetId?.startsWith(PREFIX) ? widgetId.slice(PREFIX.length) : undefined;
}

function Hatching() {
  return <Box backgroundImage='canvas.shared' height='full' width='full' />;
}

/** Offered in the widget library, like any widget (0026), though it's never stored as one. */
export const subgridManifest: WidgetManifest = {
  type: SUBGRID_TYPE,
  label: 'Shared subgrid',
  description: 'A grid of widgets that shows on every page, in the same place. Starts empty.',
  inputs: {},
  options: {},
  actionable: false,
  defaultSize: { width: 1 / 6, height: 1 / 4 },
  minSize: { columns: 1, rows: 1 },
  tokens: [],
  Component: Hatching
};

/**
 * A page with its profile's shared subgrids standing on it as widgets, above its own, so they're
 * selected, moved, resized and shown as overlap like any widget (0026).
 */
export function withSubgridsOnPage(
  page: Page,
  layout: Layout,
  subgrids: readonly SharedSubgrid[]
): { layout: Layout; page: Page } {
  if (subgrids.length === 0) {
    return { layout, page };
  }

  const combined: Layout = {
    ...layout,
    areas: {
      ...layout.areas,
      ...Object.fromEntries(
        subgrids.map(subgrid => [subgridWidgetId(subgrid.id), subgridArea(subgrid.place, layout.grid)])
      )
    }
  };

  return {
    layout: combined,
    page: {
      ...page,
      layouts: page.layouts.map(other => (other === layout ? combined : other)),
      widgets: [
        ...page.widgets,
        ...subgrids.map((subgrid): WidgetInstance => ({ id: subgridWidgetId(subgrid.id), type: SUBGRID_TYPE }))
      ]
    }
  };
}

/**
 * Takes an edit of a page made by `withSubgridsOnPage` apart again: the page, if its own widgets
 * changed, and the shared subgrids, if one was moved, resized or brought to the front. A subgrid
 * placed or resized keeps its own grid; its place is now on this page's cells (0026).
 */
export function splitSubgridsFromPage(
  edited: Page,
  page: Page,
  layout: Layout,
  subgrids: readonly SharedSubgrid[]
): { page: Page | null; subgrids: SharedSubgrid[] | null } {
  const index = page.layouts.indexOf(layout);
  const editedLayout = edited.layouts[index] ?? layout;
  const isSubgrid = (id: string) => subgridIdOf(id) !== undefined;
  const widgets = edited.widgets.filter(widget => !isSubgrid(widget.id));
  const areas = Object.fromEntries(Object.entries(editedLayout.areas).filter(([id]) => !isSubgrid(id)));

  const pageChanged =
    widgets.length !== page.widgets.length ||
    widgets.some((widget, position) => widget !== page.widgets[position]) ||
    editedLayout.grid !== layout.grid ||
    Object.entries(areas).some(([id, area]) => {
      const before = layout.areas[id];

      return !before || !areasEqual(area, before);
    });

  const nextSubgrids = edited.widgets.flatMap(widget => {
    const subgrid = subgrids.find(candidate => candidate.id === subgridIdOf(widget.id));
    const area = editedLayout.areas[widget.id];

    if (!subgrid || !area) {
      return [];
    }

    return areasEqual(area, subgridArea(subgrid.place, layout.grid))
      ? [subgrid]
      : [{ ...subgrid, place: { area, grid: layout.grid } }];
  });
  const subgridsChanged =
    nextSubgrids.length !== subgrids.length || nextSubgrids.some((subgrid, position) => subgrid !== subgrids[position]);

  return {
    page: pageChanged
      ? {
          ...edited,
          layouts: edited.layouts.map((other, position) => (position === index ? { ...other, areas } : other)),
          widgets
        }
      : null,
    subgrids: subgridsChanged ? nextSubgrids : null
  };
}

type SubgridContentsProps = {
  renderWidget: (widget: WidgetInstance) => ReactNode;
  subgrid: SharedSubgrid;
};

/**
 * A shared subgrid's widgets on its own grid, under a neutral hatching: seen, but not touched,
 * until it's entered (0026).
 */
export function SubgridContents({ renderWidget, subgrid }: SubgridContentsProps) {
  return (
    <Box height='full' position='relative'>
      <LayoutGrid className={styles.grid} grid={subgrid.grid} height='full'>
        {subgrid.widgets.map(widget => {
          const area = subgrid.areas[widget.id];

          return area ? (
            <LayoutArea area={area} key={widget.id} minHeight='none' minWidth='none'>
              {renderWidget(widget)}
            </LayoutArea>
          ) : null;
        })}
      </LayoutGrid>
      <Box backgroundImage='canvas.shared' inset='none' position='absolute' />
    </Box>
  );
}
