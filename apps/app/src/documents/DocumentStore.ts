import type {
  ClientMessage,
  DocumentRequest,
  DocumentResultMessage,
  DocumentStatus,
  DocumentSummary,
  ServerMessage,
  StoredDocument
} from '@mfdiy/schema';

/** The connection to the bridge, as far as documents are concerned. */
export type BridgeLink = {
  isOpen(): boolean;
  send(message: ClientMessage): void;
  subscribeMessages(listener: (message: ServerMessage) => void): () => void;
  subscribeConnection(listener: () => void): () => void;
};

export type WatchedDocument =
  { status: 'loading' } | { status: 'missing' } | { status: 'ready'; stored: StoredDocument };

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type DocumentRequestInput = DistributiveOmit<DocumentRequest, 'requestId'>;

export type DocumentOutcome =
  | { status: 'ok'; id: string; revision: number }
  | { status: Exclude<DocumentStatus, 'ok'> | 'disconnected' | 'timeout' };

const REQUEST_TIMEOUT_MS = 10_000;

const LOADING: WatchedDocument = { status: 'loading' };
const MISSING: WatchedDocument = { status: 'missing' };

/**
 * The library on the bridge, and the documents being looked at right now. Keeps the last known
 * state while disconnected, so a display survives a bridge restart.
 */
export class DocumentStore {
  #link: BridgeLink;
  #wasOpen = false;

  #library: readonly DocumentSummary[] | undefined;
  #libraryListeners = new Set<() => void>();

  #watched = new Map<string, { state: WatchedDocument; listeners: Set<() => void> }>();

  #requests = new Map<string, (outcome: DocumentOutcome) => void>();
  #nextRequestId = 0;

  constructor(link: BridgeLink) {
    this.#link = link;

    link.subscribeMessages(message => this.#handleMessage(message));
    link.subscribeConnection(() => this.#handleConnection());
  }

  /* ---------------- Library ---------------- */

  /** Undefined until the bridge has sent it. */
  getLibrary = (): readonly DocumentSummary[] | undefined => this.#library;

  subscribeLibrary = (listener: () => void): (() => void) => {
    this.#libraryListeners.add(listener);

    return () => this.#libraryListeners.delete(listener);
  };

  /* ---------------- Watching ---------------- */

  getDocument(id: string): WatchedDocument {
    return this.#watched.get(id)?.state ?? LOADING;
  }

  /** Asks the bridge for a document, and for its changes until unsubscribed. */
  watch(id: string, listener: () => void): () => void {
    let watched = this.#watched.get(id);

    if (!watched) {
      watched = { state: LOADING, listeners: new Set() };
      this.#watched.set(id, watched);
      this.#sendWatch();
    }

    const { listeners } = watched;

    listeners.add(listener);

    return () => {
      listeners.delete(listener);

      if (listeners.size === 0 && this.#watched.get(id)?.listeners === listeners) {
        this.#watched.delete(id);
        this.#sendWatch();
      }
    };
  }

  /* ---------------- Requests ---------------- */

  request(request: DocumentRequestInput): Promise<DocumentOutcome> {
    if (!this.#link.isOpen()) {
      return Promise.resolve({ status: 'disconnected' });
    }

    const requestId = `document-${this.#nextRequestId++}`;

    return new Promise(resolve => {
      const settle = (outcome: DocumentOutcome) => {
        clearTimeout(timeout);
        this.#requests.delete(requestId);
        resolve(outcome);
      };

      const timeout = setTimeout(() => settle({ status: 'timeout' }), REQUEST_TIMEOUT_MS);

      this.#requests.set(requestId, settle);
      this.#link.send({ ...request, requestId });
    });
  }

  /* ---------------- Internals ---------------- */

  #handleConnection() {
    const isOpen = this.#link.isOpen();

    if (isOpen && !this.#wasOpen && this.#watched.size > 0) {
      this.#sendWatch();
    }

    if (!isOpen) {
      for (const settle of [...this.#requests.values()]) {
        settle({ status: 'disconnected' });
      }
    }

    this.#wasOpen = isOpen;
  }

  #handleMessage(message: ServerMessage) {
    switch (message.type) {
      case 'library':
        this.#library = message.documents;

        for (const listener of this.#libraryListeners) {
          listener();
        }

        break;

      case 'document':
        this.#setDocument(message.stored.id, { status: 'ready', stored: message.stored });
        break;

      case 'document-missing':
        this.#setDocument(message.id, MISSING);
        break;

      case 'document-result':
        this.#requests.get(message.requestId)?.(toOutcome(message));
        break;
    }
  }

  #setDocument(id: string, state: WatchedDocument) {
    const watched = this.#watched.get(id);

    if (!watched) {
      return;
    }

    watched.state = state;

    for (const listener of watched.listeners) {
      listener();
    }
  }

  #sendWatch() {
    if (this.#link.isOpen()) {
      this.#link.send({ type: 'watch', ids: [...this.#watched.keys()] });
    }
  }
}

function toOutcome({ status, id, revision }: DocumentResultMessage): DocumentOutcome {
  if (status !== 'ok') {
    return { status };
  }

  return id === undefined || revision === undefined ? { status: 'failed' } : { status, id, revision };
}
