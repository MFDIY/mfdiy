import type { Page } from '@mfdiy/schema';

import { createContext, useContext } from 'react';

export type PageNavigation = {
  /** The page shown. */
  pageId: string;
  pages: readonly Pick<Page, 'id' | 'name'>[];
  /** Shows another page; does nothing where pages aren't switched by the MFD, as in the editor. */
  showPage: (pageId: string) => void;
};

const PageNavigationContext = createContext<PageNavigation>({ pageId: '', pages: [], showPage: () => undefined });

/** What page buttons (0018) switch between, given by whatever shows the MFD. */
export const PageNavigationProvider = PageNavigationContext.Provider;

export function usePageNavigation(): PageNavigation {
  return useContext(PageNavigationContext);
}
