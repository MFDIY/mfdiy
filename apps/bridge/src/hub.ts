import type { TelemetrySource } from './source.js';
import type { WebSocket } from 'ws';

import {
  ClientMessageSchema,
  PROTOCOL_VERSION,
  type ActionStatus,
  type ServerMessage,
  type SignalValues
} from '@mfdiy/schema';
import * as v from 'valibot';

/** Maximum frame rate sent to clients; changes in between are merged. */
const FRAME_INTERVAL_MS = 50;

/** Per-client limit on action requests, to stop a stuck button flooding the game. */
const ACTION_LIMIT = { count: 10, perMs: 1000 };

/**
 * Fans telemetry out to connected browsers and validates what they send back. Only actions the
 * adapter declares can be triggered (the allowlist from CLAUDE.md).
 */
export function createHub(source: TelemetrySource) {
  const clients = new Set<WebSocket>();
  let pending: SignalValues = {};

  const unsubscribe = source.subscribe(changed => {
    pending = { ...pending, ...changed };
  });

  const timer = setInterval(() => {
    if (Object.keys(pending).length === 0 || clients.size === 0) {
      pending = {};

      return;
    }

    const message = serialise({ type: 'frame', t: Date.now(), values: pending });

    pending = {};

    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  }, FRAME_INTERVAL_MS);

  function connect(socket: WebSocket) {
    clients.add(socket);

    const actionTimes: number[] = [];

    send(socket, {
      type: 'hello',
      protocol: PROTOCOL_VERSION,
      game: source.adapter.game,
      source: source.kind,
      signals: source.adapter.signals,
      actions: source.adapter.actions
    });

    send(socket, { type: 'frame', t: Date.now(), values: source.snapshot() });

    socket.on('message', async raw => {
      const parsed = v.safeParse(ClientMessageSchema, safeJson(String(raw)));

      if (!parsed.success) {
        return;
      }

      const { requestId, action, holdMs } = parsed.output;
      const now = Date.now();

      while (actionTimes.length > 0 && now - (actionTimes[0] ?? 0) > ACTION_LIMIT.perMs) {
        actionTimes.shift();
      }

      let status: ActionStatus;

      if (actionTimes.length >= ACTION_LIMIT.count) {
        status = 'rate-limited';
      } else if (!source.adapter.actions.some(candidate => candidate.id === action)) {
        status = 'unknown-action';
      } else {
        actionTimes.push(now);
        status = await source.triggerAction(action, holdMs).catch((): ActionStatus => 'failed');
      }

      send(socket, { type: 'action-result', requestId, status });
    });

    socket.on('close', () => clients.delete(socket));
    socket.on('error', () => clients.delete(socket));
  }

  function stop() {
    clearInterval(timer);
    unsubscribe();

    for (const client of clients) {
      client.close();
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
