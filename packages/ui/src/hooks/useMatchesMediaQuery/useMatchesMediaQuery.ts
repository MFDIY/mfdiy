import { useMemo, useSyncExternalStore } from 'react';

import { getStore } from './getStore.js';

/**
 * Subscribes to a Media Query. Returns `false` during SSR and client hydration.
 */
export function useMatchesMediaQuery(query: string): boolean {
  const store = useMemo(() => getStore(query), [query]);

  return useSyncExternalStore<boolean>(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
