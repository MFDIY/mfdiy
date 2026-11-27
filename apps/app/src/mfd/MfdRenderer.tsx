import type { Area, MfdDocument, WidgetInstance } from '@mfdiy/schema';

import { applyTokens, LayoutArea, LayoutGrid, mfdRoot, pressHandlers } from '@mfdiy/instruments';
import { selectLayout, subgridArea } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';
import { useMatchesMediaQuery } from '@mfdiy/ui/hooks';

import * as styles from './MfdRenderer.css.js';
import { MfdWidget } from './MfdWidget.js';
import { PageNavigationProvider } from './PageNavigation.js';

type MfdRendererProps = {
  document: MfdDocument;
  pageId: string;
  onPageChange: (pageId: string) => void;
};

/**
 * Renders an MFD document: theme tokens cascade document → page → widget, and each widget
 * subscribes only to the signals it is bound to. Shared subgrids are drawn above the page's widgets,
 * so they take the touches where they overlap; between their widgets, touches reach the page
 * (0026).
 */
export function MfdRenderer({ document, pageId, onPageChange }: MfdRendererProps) {
  const page = document.pages.find(candidate => candidate.id === pageId) ?? document.pages[0];
  const portrait = useMatchesMediaQuery('(orientation: portrait)');

  if (!page) {
    return null;
  }

  const layout = selectLayout(page, portrait ? 'portrait' : 'landscape');

  return (
    <PageNavigationProvider value={{ pageId: page.id, pages: document.pages, showPage: onPageChange }}>
      <Box
        className={[mfdRoot, styles.screen]}
        cssVariables={applyTokens(document.tokens)}
        display='grid'
        height='full'
      >
        <LayoutGrid className={styles.page} cssVariables={applyTokens(page.tokens)} grid={layout.grid} minHeight='none'>
          {page.widgets.map(widget => {
            const area = layout.areas[widget.id];

            return area ? <WidgetSlot area={area} key={widget.id} widget={widget} /> : null;
          })}
          {(document.subgrids ?? []).map(subgrid => (
            <LayoutArea
              area={subgridArea(subgrid.place, layout.grid)}
              key={subgrid.id}
              minHeight='none'
              minWidth='none'
              pointerEvents='none'
            >
              <LayoutGrid className={styles.page} grid={subgrid.grid} height='full'>
                {subgrid.widgets.map(widget => {
                  const area = subgrid.areas[widget.id];

                  return area ? <WidgetSlot area={area} key={widget.id} widget={widget} /> : null;
                })}
              </LayoutGrid>
            </LayoutArea>
          ))}
        </LayoutGrid>
        {document.pages.length > 1 ? (
          <Box className={styles.tabs} cssVariables={applyTokens(page.tokens)} display='flex' tagName='nav'>
            {document.pages.map(candidate => (
              <Box
                {...pressHandlers(() => onPageChange(candidate.id))}
                appearance='none'
                aria-current={candidate.id === page.id ? 'page' : undefined}
                backgroundColor='transparent'
                className={styles.tab}
                cursor='pointer'
                flexBasis='fluid'
                flexGrow='1'
                key={candidate.id}
                tagName='button'
                touchAction='none'
                type='button'
              >
                {candidate.name}
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
    </PageNavigationProvider>
  );
}

function WidgetSlot({ area, widget }: { area: Area; widget: WidgetInstance }) {
  return (
    <LayoutArea
      area={area}
      cssVariables={applyTokens(widget.tokens)}
      minHeight='none'
      minWidth='none'
      pointerEvents='auto'
    >
      <MfdWidget widget={widget} />
    </LayoutArea>
  );
}
