import { MediaQueryStore } from './MediaQueryStore.js';

const stores = new Map<string, MediaQueryStore>();

export function getStore(query: string): MediaQueryStore {
  let store = stores.get(query);

  if (typeof store === 'undefined') {
    store = new MediaQueryStore(query, () => stores.delete(query));
    stores.set(query, store);
  }

  return store;
}
