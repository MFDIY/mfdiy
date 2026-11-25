import {
  PROTOCOL_VERSION,
  ServerMessageSchema,
  type ActionStatus,
  type ClientMessage,
  type HelloMessage,
  type ServerMessage,
  type SignalValue
} from '@mfdiy/schema';
import * as v from 'valibot';

export type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'incompatible';

export type Connection = {
  status: ConnectionStatus;
  /** What the bridge announced: game, source, signal catalogue and actions. */
  hello: HelloMessage | undefined;
};

export type ActionOutcome = ActionStatus | 'timeout' | 'disconnected';

const ACTION_TIMEOUT_MS = 5000;
const RECONNECT_DELAYS_MS = [500, 1000, 2000, 5000];

/**
 * Holds the live telemetry outside React. Components subscribe to just the signals they render
 * (via `useSyncExternalStore`), so a 20 Hz stream only re-renders widgets whose signals changed.
 */
export class TelemetryStore {
  #url: string;
  #socket: WebSocket | undefined;
  #reconnectAttempt = 0;
  #reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  #stopped = true;

  #connection: Connection = { status: 'closed', hello: undefined };
  #connectionListeners = new Set<() => void>();
  #messageListeners = new Set<(message: ServerMessage) => void>();

  #values = new Map<string, SignalValue>();
  #versions = new Map<string, number>();
  #signalListeners = new Map<string, Set<() => void>>();
  #selections = new Map<string, { versions: number[]; values: SignalValue[] }>();

  #pendingActions = new Map<string, (outcome: ActionOutcome) => void>();
  #nextRequestId = 0;

  constructor(url: string) {
    this.#url = url;
  }

  start() {
    this.#stopped = false;
    this.#open();
  }

  stop() {
    this.#stopped = true;
    clearTimeout(this.#reconnectTimer);
    this.#socket?.close();
    this.#socket = undefined;
    this.#setConnection({ status: 'closed', hello: this.#connection.hello });
  }

  /* ---------------- Connection ---------------- */

  getConnection = (): Connection => this.#connection;

  subscribeConnection = (listener: () => void): (() => void) => {
    this.#connectionListeners.add(listener);

    return () => this.#connectionListeners.delete(listener);
  };

  isOpen = (): boolean => this.#connection.status === 'open';

  /** Everything the bridge sends, for stores that share this connection. */
  subscribeMessages = (listener: (message: ServerMessage) => void): (() => void) => {
    this.#messageListeners.add(listener);

    return () => this.#messageListeners.delete(listener);
  };

  send = (message: ClientMessage) => {
    this.#socket?.send(JSON.stringify(message));
  };

  /* ---------------- Signals ---------------- */

  /**
   * Returns the current values for `ids`. The same array instance is returned until one of those
   * signals changes, which is what `useSyncExternalStore` needs to avoid needless re-renders.
   */
  selectValues(ids: readonly string[]): readonly SignalValue[] {
    const key = ids.join('|');
    const versions = ids.map(id => this.#versions.get(id) ?? 0);
    const cached = this.#selections.get(key);

    if (cached && cached.versions.every((version, index) => version === versions[index])) {
      return cached.values;
    }

    const values = ids.map(id => this.#values.get(id) ?? null);

    this.#selections.set(key, { versions, values });

    return values;
  }

  subscribeSignals(ids: readonly string[], listener: () => void): () => void {
    for (const id of ids) {
      let listeners = this.#signalListeners.get(id);

      if (!listeners) {
        listeners = new Set();
        this.#signalListeners.set(id, listeners);
      }

      listeners.add(listener);
    }

    return () => {
      for (const id of ids) {
        this.#signalListeners.get(id)?.delete(listener);
      }
    };
  }

  /* ---------------- Actions ---------------- */

  triggerAction(action: string, holdMs?: number): Promise<ActionOutcome> {
    if (!this.isOpen()) {
      return Promise.resolve('disconnected');
    }

    const requestId = String(this.#nextRequestId++);
    const message: ClientMessage = { type: 'action', requestId, action, ...(holdMs === undefined ? {} : { holdMs }) };

    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        this.#pendingActions.delete(requestId);
        resolve('timeout');
      }, ACTION_TIMEOUT_MS);

      this.#pendingActions.set(requestId, outcome => {
        clearTimeout(timeout);
        this.#pendingActions.delete(requestId);
        resolve(outcome);
      });

      this.send(message);
    });
  }

  /* ---------------- Internals ---------------- */

  #open() {
    this.#setConnection({ status: 'connecting', hello: this.#connection.hello });

    const socket = new WebSocket(this.#url);

    this.#socket = socket;

    socket.addEventListener('message', event => this.#handleMessage(String(event.data)));

    socket.addEventListener('close', () => {
      if (this.#socket !== socket) {
        return;
      }

      for (const settle of this.#pendingActions.values()) {
        settle('disconnected');
      }

      if (this.#connection.status !== 'incompatible') {
        this.#setConnection({ status: 'closed', hello: this.#connection.hello });
      }

      if (!this.#stopped && this.#connection.status !== 'incompatible') {
        const delay = RECONNECT_DELAYS_MS[Math.min(this.#reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)];

        this.#reconnectAttempt++;
        this.#reconnectTimer = setTimeout(() => this.#open(), delay);
      }
    });
  }

  #handleMessage(data: string) {
    let json: unknown;

    try {
      json = JSON.parse(data);
    } catch {
      return;
    }

    const parsed = v.safeParse(ServerMessageSchema, json);

    if (!parsed.success) {
      return;
    }

    const message = parsed.output;

    switch (message.type) {
      case 'hello':
        if (message.protocol !== PROTOCOL_VERSION) {
          this.#setConnection({ status: 'incompatible', hello: message });
          this.#socket?.close();

          return;
        }

        this.#reconnectAttempt = 0;
        this.#setConnection({ status: 'open', hello: message });
        break;

      case 'frame':
        this.#applyValues(message.values);
        break;

      case 'action-result':
        this.#pendingActions.get(message.requestId)?.(message.status);
        break;
    }

    for (const listener of this.#messageListeners) {
      listener(message);
    }
  }

  #applyValues(values: Record<string, SignalValue>) {
    const notify = new Set<() => void>();

    for (const [id, value] of Object.entries(values)) {
      if (this.#values.get(id) === value) {
        continue;
      }

      this.#values.set(id, value);
      this.#versions.set(id, (this.#versions.get(id) ?? 0) + 1);

      for (const listener of this.#signalListeners.get(id) ?? []) {
        notify.add(listener);
      }
    }

    for (const listener of notify) {
      listener();
    }
  }

  #setConnection(connection: Connection) {
    this.#connection = connection;

    for (const listener of this.#connectionListeners) {
      listener();
    }
  }
}
