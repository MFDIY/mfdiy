import type { ReactNode } from 'react';

import { Box, ScrollContainer } from '@mfdiy/ui/components';

export type HeaderLayoutProps = {
  /** What scrolls under the header. */
  children: ReactNode;
  /** The `AppHeader`, kept in view above a full-width hairline. */
  header: ReactNode;
};

/**
 * The app's own pages (the home page, Connect a device): a header that stays put over content that
 * scrolls in a container of its own, since the app itself never scrolls (0007).
 */
export function HeaderLayout({ children, header }: HeaderLayoutProps) {
  return (
    <Box display='flex' flexDirection='column' height='viewport' overflow='hidden' tagName='main' width='viewport'>
      <Box borderBottomColor='line' borderBottomStyle='solid' borderBottomWidth='hairline' flexShrink='0'>
        {header}
      </Box>
      <ScrollContainer hideEdges>
        <Box padding='6x'>{children}</Box>
      </ScrollContainer>
    </Box>
  );
}
