import type { Area, MfdDocument, WidgetInstance } from '@mfdiy/schema';

import { applyTokens, mfdRoot, pressHandlers } from '@mfdiy/instruments';
import { selectLayout } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';
import { useMatchesMediaQuery } from '@mfdiy/ui/hooks';

import * as styles from './MfdRenderer.css.js';
import { MfdWidget } from './MfdWidget.js';

type MfdRendererProps = {
  document: MfdDocument;
  pageId: string;
  onPageChange: (pageId: string) => void;
};

/**
 * Renders an MFD document: theme tokens cascade document → page → widget, and each widget
 * subscribes only to the signals it is bound to.
 */
export function MfdRenderer({ document, pageId, onPageChange }: MfdRendererProps) {
  const page = document.pages.find(candidate => candidate.id === pageId) ?? document.pages[0];
  const portrait = useMatchesMediaQuery('(orientation: portrait)');

  if (!page) {
    return null;
  }

  const layout = selectLayout(page, portrait ? 'portrait' : 'landscape');

  return (
    <Box className={[mfdRoot, styles.screen]} display='grid' height='full' style={applyTokens(document.tokens)}>
      <Box
        className={styles.page}
        display='grid'
        minHeight='none'
        style={{
          ...applyTokens(page.tokens),
          gridTemplateColumns: `repeat(${layout.grid.columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.grid.rows}, minmax(0, 1fr))`
        }}
      >
        {page.widgets.map(widget => {
          const area = layout.areas[widget.id];

          return area ? <WidgetSlot area={area} key={widget.id} widget={widget} /> : null;
        })}
      </Box>
      {document.pages.length > 1 ? (
        <Box className={styles.tabs} display='flex' style={applyTokens(page.tokens)} tagName='nav'>
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
  );
}

function WidgetSlot({ area, widget }: { area: Area; widget: WidgetInstance }) {
  return (
    <Box
      minHeight='none'
      minWidth='none'
      style={{
        ...applyTokens(widget.tokens),
        gridColumn: `${area.column} / span ${area.columnSpan}`,
        gridRow: `${area.row} / span ${area.rowSpan}`
      }}
    >
      <MfdWidget widget={widget} />
    </Box>
  );
}
