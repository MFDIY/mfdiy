import type { Library } from './library.js';
import type { TelemetrySource } from './source.js';
import type { WebSocket } from 'ws';

import {
  ClientMessageSchema,
  PROTOCOL_VERSION,
  type ActionMessage,
  type ActionStatus,
  type ServerMessage,
  type SignalValues
} from '@mfdiy/schema';
import * as v from 'valibot';

/** Maximum frame rate sent to clients; changes in between are merged. */
const FRAME_INTERVAL_MS = 50;

/** Per-client limit on action requests, to stop a stuck button flooding the game. */
const ACTION_LIMIT = { count: 10, perMs: 1000 };

type Client = {
  /** Ids of the documents the client wants to be sent. */
  watching: Set<string>;
  actionTimes: number[];
};

/** Enough of a malformed document request to answer it. */
const UnreadableRequestSchema = v.object({
  type: v.pipe(v.string(), v.startsWith('document-')),
  requestId: v.pipe(v.string(), v.minLength(1), v.maxLength(64))
});

/**
 * Fans telemetry and saved documents out to connected browsers and validates what they send back.
 * Only actions the adapter declares can be triggered (the allowlist from CLAUDE.md).
 */
export function createHub(source: TelemetrySource, library: Library) {
  const clients = new Map<WebSocket, Client>();
  let pending: SignalValues = {};

  const unsubscribeSource = source.subscribe(changed => {
    pending = { ...pending, ...changed };
  });

  const unsubscribeLibrary = library.subscribe(change => {
    const id = change.kind === 'changed' ? change.stored.id : change.id;

    for (const [socket, { watching }] of clients) {
      if (watching.has(id)) {
        sendDocument(socket, id);
      }

      send(socket, { type: 'library', documents: library.list() });
    }
  });

  const timer = setInterval(() => {
    if (Object.keys(pending).length === 0 || clients.size === 0) {
      pending = {};

      return;
    }

    const message = serialise({ type: 'frame', t: Date.now(), values: pending });

    pending = {};

    for (const socket of clients.keys()) {
      if (socket.readyState === socket.OPEN) {
        socket.send(message);
      }
    }
  }, FRAME_INTERVAL_MS);

  function sendDocument(socket: WebSocket, id: string) {
    const stored = library.get(id);

    send(socket, stored ? { type: 'document', stored } : { type: 'document-missing', id });
  }

  function handleAction({ actionTimes }: Client, { action, holdMs }: ActionMessage): Promise<ActionStatus> {
    const now = Date.now();

    while (actionTimes.length > 0 && now - (actionTimes[0] ?? 0) > ACTION_LIMIT.perMs) {
      actionTimes.shift();
    }

    if (actionTimes.length >= ACTION_LIMIT.count) {
      return Promise.resolve('rate-limited');
    }

    if (!source.adapter.actions.some(candidate => candidate.id === action)) {
      return Promise.resolve('unknown-action');
    }

    actionTimes.push(now);

    return source.triggerAction(action, holdMs).catch((): ActionStatus => 'failed');
  }

  async function handleMessage(socket: WebSocket, client: Client, json: unknown) {
    const parsed = v.safeParse(ClientMessageSchema, json);

    if (!parsed.success) {
      if (v.is(UnreadableRequestSchema, json)) {
        send(socket, { type: 'document-result', requestId: json.requestId, status: 'invalid' });
      }

      return;
    }

    const message = parsed.output;

    switch (message.type) {
      case 'action':
        send(socket, {
          type: 'action-result',
          requestId: message.requestId,
          status: await handleAction(client, message)
        });
        break;

      case 'watch': {
        const added = message.ids.filter(id => !client.watching.has(id));

        client.watching = new Set(message.ids);

        for (const id of added) {
          sendDocument(socket, id);
        }

        break;
      }

      default:
        send(socket, {
          type: 'document-result',
          requestId: message.requestId,
          ...(await library.handle(message))
        });
    }
  }

  function connect(socket: WebSocket) {
    const client: Client = { watching: new Set(), actionTimes: [] };

    clients.set(socket, client);

    send(socket, {
      type: 'hello',
      protocol: PROTOCOL_VERSION,
      game: source.adapter.game,
      source: source.kind,
      signals: source.adapter.signals,
      actions: source.adapter.actions
    });

    send(socket, { type: 'frame', t: Date.now(), values: source.snapshot() });
    send(socket, { type: 'library', documents: library.list() });

    socket.on('message', raw => void handleMessage(socket, client, safeJson(String(raw))));
    socket.on('close', () => clients.delete(socket));
    socket.on('error', () => clients.delete(socket));
  }

  function stop() {
    clearInterval(timer);
    unsubscribeSource();
    unsubscribeLibrary();

    for (const socket of clients.keys()) {
      socket.close();
    }
  }

  return {
    connect,
    stop,
    get clientCount() {
      return clients.size;
    }
  };
}

function serialise(message: ServerMessage): string {
  return JSON.stringify(message);
}

function send(socket: WebSocket, message: ServerMessage) {
  if (socket.readyState === socket.OPEN) {
    socket.send(serialise(message));
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
