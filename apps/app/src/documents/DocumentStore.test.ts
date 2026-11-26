import type { ClientMessage, ServerMessage, StoredDocument } from '@mfdiy/schema';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentStore, type BridgeLink } from './DocumentStore.js';

const ID = 'abcdef0123456789';

const stored: StoredDocument = {
  id: ID,
  revision: 1,
  updatedAt: 0,
  document: { schema: 2, name: 'Fighter', game: 'test', pages: [] }
};

function createLink() {
  const messageListeners = new Set<(message: ServerMessage) => void>();
  const connectionListeners = new Set<() => void>();
  const sent: ClientMessage[] = [];
  let open = true;

  const link: BridgeLink = {
    isOpen: () => open,
    send: message => sent.push(message),
    subscribeMessages(listener) {
      messageListeners.add(listener);

      return () => messageListeners.delete(listener);
    },
    subscribeConnection(listener) {
      connectionListeners.add(listener);

      return () => connectionListeners.delete(listener);
    }
  };

  return {
    link,
    sent,
    receive: (message: ServerMessage) => messageListeners.forEach(listener => listener(message)),
    setOpen(next: boolean) {
      open = next;
      connectionListeners.forEach(listener => listener());
    }
  };
}

let bridge: ReturnType<typeof createLink>;
let store: DocumentStore;

beforeEach(() => {
  vi.useFakeTimers();
  bridge = createLink();
  store = new DocumentStore(bridge.link);
  bridge.setOpen(true);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('watching', () => {
  it('asks for a document once, however many components show it', () => {
    const stopFirst = store.watch(ID, vi.fn());
    const stopSecond = store.watch(ID, vi.fn());

    stopFirst();
    expect(bridge.sent).toEqual([{ type: 'watch', ids: [ID] }]);

    stopSecond();
    expect(bridge.sent.at(-1)).toEqual({ type: 'watch', ids: [] });
  });

  it('follows changes and deletion', () => {
    const listener = vi.fn();

    store.watch(ID, listener);
    expect(store.getDocument(ID)).toEqual({ status: 'loading' });

    bridge.receive({ type: 'document', stored });
    expect(store.getDocument(ID)).toEqual({ status: 'ready', stored });

    bridge.receive({ type: 'document-missing', id: ID });
    expect(store.getDocument(ID)).toEqual({ status: 'missing' });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('keeps the document while disconnected and asks again afterwards', () => {
    store.watch(ID, vi.fn());
    bridge.receive({ type: 'document', stored });
    bridge.setOpen(false);

    expect(store.getDocument(ID)).toEqual({ status: 'ready', stored });

    bridge.sent.length = 0;
    bridge.setOpen(true);

    expect(bridge.sent).toEqual([{ type: 'watch', ids: [ID] }]);
  });
});

describe('requests', () => {
  const rename = () => store.request({ type: 'document-rename', id: ID, revision: 1, name: 'Interceptor' });

  it('resolves with the bridge’s answer', async () => {
    const outcome = rename();
    const [request] = bridge.sent;

    bridge.receive({
      type: 'document-result',
      requestId: request && 'requestId' in request ? request.requestId : '',
      status: 'ok',
      id: ID,
      revision: 2
    });

    expect(await outcome).toEqual({ status: 'ok', id: ID, revision: 2 });
  });

  it('fails when the connection is lost, or was never there', async () => {
    const outcome = rename();

    bridge.setOpen(false);

    expect(await outcome).toEqual({ status: 'disconnected' });
    expect(await rename()).toEqual({ status: 'disconnected' });
  });

  it('gives up when the bridge doesn’t answer', async () => {
    const outcome = rename();

    vi.advanceTimersByTime(10_000);

    expect(await outcome).toEqual({ status: 'timeout' });
  });
});
