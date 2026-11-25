import type { DocumentSummary } from '@mfdiy/schema';

import { DocumentIdSchema } from '@mfdiy/schema';
import { createContext, useCallback, useContext, useState, useSyncExternalStore, type PropsWithChildren } from 'react';
import * as v from 'valibot';

import { useTelemetryStore } from '../telemetry/TelemetryProvider.js';

import {
  DocumentStore,
  type DocumentOutcome,
  type DocumentRequestInput,
  type WatchedDocument
} from './DocumentStore.js';

const DocumentsContext = createContext<DocumentStore | undefined>(undefined);

/** Must be inside `<TelemetryProvider>`, whose connection it shares. */
export function DocumentsProvider({ children }: PropsWithChildren) {
  const link = useTelemetryStore();
  const [store] = useState(() => new DocumentStore(link));

  return <DocumentsContext.Provider value={store}>{children}</DocumentsContext.Provider>;
}

function useDocumentStore(): DocumentStore {
  const store = useContext(DocumentsContext);

  if (!store) {
    throw new Error('useDocumentStore must be used inside <DocumentsProvider>.');
  }

  return store;
}

/** Every saved document; undefined until the bridge has sent them. */
export function useLibrary(): readonly DocumentSummary[] | undefined {
  const store = useDocumentStore();

  return useSyncExternalStore(store.subscribeLibrary, store.getLibrary);
}

const MISSING: WatchedDocument = { status: 'missing' };

/** A saved document, kept up to date with changes made on other devices. */
export function useWatchedDocument(id: string): WatchedDocument {
  const store = useDocumentStore();
  // The id comes from the address bar, so it can be anything.
  const valid = v.is(DocumentIdSchema, id);

  const subscribe = useCallback(
    (listener: () => void) => (valid ? store.watch(id, listener) : () => undefined),
    [store, id, valid]
  );

  return useSyncExternalStore(subscribe, () => (valid ? store.getDocument(id) : MISSING));
}

export function useDocumentRequest(): (request: DocumentRequestInput) => Promise<DocumentOutcome> {
  const store = useDocumentStore();

  return useCallback(request => store.request(request), [store]);
}
