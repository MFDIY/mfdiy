import * as v from 'valibot';

import {
  ActionDefinitionSchema,
  GameInfoSchema,
  IdSchema,
  SignalDefinitionSchema,
  SignalValuesSchema
} from './signals.js';

/**
 * WebSocket protocol between the bridge and browsers. Bump `PROTOCOL_VERSION` on any breaking
 * change; the app refuses to talk to a bridge with a different version.
 */
export const PROTOCOL_VERSION = 1;

export const bridgeSources = ['game', 'simulator'] as const;

export type BridgeSource = (typeof bridgeSources)[number];

export const actionStatuses = ['ok', 'unknown-action', 'unavailable', 'rate-limited', 'failed'] as const;

export type ActionStatus = (typeof actionStatuses)[number];

/* ---------------------- Bridge → browser ---------------------- */

/** Sent once on connect: everything a client needs to interpret frames and offer actions. */
export const HelloMessageSchema = v.object({
  type: v.literal('hello'),
  protocol: v.number(),
  game: GameInfoSchema,
  source: v.picklist(bridgeSources),
  signals: v.array(SignalDefinitionSchema),
  actions: v.array(ActionDefinitionSchema)
});

/**
 * Signal values. The first frame after `hello` is a full snapshot; later frames only contain
 * signals that changed. `t` is the bridge's clock in milliseconds since the Unix epoch.
 */
export const FrameMessageSchema = v.object({
  type: v.literal('frame'),
  t: v.number(),
  values: SignalValuesSchema
});

export const ActionResultMessageSchema = v.object({
  type: v.literal('action-result'),
  requestId: v.pipe(v.string(), v.maxLength(64)),
  status: v.picklist(actionStatuses)
});

export const ServerMessageSchema = v.variant('type', [
  HelloMessageSchema,
  FrameMessageSchema,
  ActionResultMessageSchema
]);

export type HelloMessage = v.InferOutput<typeof HelloMessageSchema>;
export type FrameMessage = v.InferOutput<typeof FrameMessageSchema>;
export type ActionResultMessage = v.InferOutput<typeof ActionResultMessageSchema>;
export type ServerMessage = v.InferOutput<typeof ServerMessageSchema>;

/* ---------------------- Browser → bridge ---------------------- */

export const ActionMessageSchema = v.object({
  type: v.literal('action'),
  requestId: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  action: IdSchema,
  holdMs: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(10_000)))
});

export const ClientMessageSchema = v.variant('type', [ActionMessageSchema]);

export type ActionMessage = v.InferOutput<typeof ActionMessageSchema>;
export type ClientMessage = v.InferOutput<typeof ClientMessageSchema>;
