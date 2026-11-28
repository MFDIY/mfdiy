import * as v from 'valibot';

import { MfdDocumentSchema } from './document.js';
import { DocumentIdSchema, DocumentSummarySchema, RevisionSchema, StoredDocumentSchema } from './library.js';
import { MFD_SIGNAL_PREFIX } from './pageSignals.js';
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
export const PROTOCOL_VERSION = 2;

export const bridgeSources = ['game', 'simulator'] as const;

export type BridgeSource = (typeof bridgeSources)[number];

export const actionStatuses = ['ok', 'unknown-action', 'unavailable', 'rate-limited', 'failed'] as const;

export type ActionStatus = (typeof actionStatuses)[number];

/**
 * - `stale`: the document has changed since the revision the request was based on.
 * - `invalid`: the request doesn't match the schema.
 * - `full`: the library can't hold more documents.
 */
export const documentStatuses = ['ok', 'stale', 'not-found', 'invalid', 'full', 'failed'] as const;

export type DocumentStatus = (typeof documentStatuses)[number];

const RequestIdSchema = v.pipe(v.string(), v.minLength(1), v.maxLength(64));

/* ---------------------- Bridge → browser ---------------------- */

/** Sent once on connect: everything a client needs to interpret frames and offer actions. */
export const HelloMessageSchema = v.object({
  type: v.literal('hello'),
  protocol: v.number(),
  /**
   * Where other devices on the network can open the app, such as `http://192.168.1.20`, the
   * likeliest first (0004). Empty when the gaming PC isn't on a network. Optional, so a bridge
   * that doesn't send it still reaches the protocol check.
   */
  addresses: v.optional(v.pipe(v.array(v.pipe(v.string(), v.url())), v.maxLength(16)), []),
  game: GameInfoSchema,
  source: v.picklist(bridgeSources),
  /** The game's signals; never in the MFD's own namespace (`mfd.`), so they can't clash with its signals. */
  signals: v.pipe(
    v.array(SignalDefinitionSchema),
    v.check(
      signals => signals.every(signal => !signal.id.startsWith(MFD_SIGNAL_PREFIX)),
      `Game signals can't start with "${MFD_SIGNAL_PREFIX}"`
    )
  ),
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
  requestId: RequestIdSchema,
  status: v.picklist(actionStatuses)
});

/** Every saved document. Sent on connect and whenever any of them changes. */
export const LibraryMessageSchema = v.object({
  type: v.literal('library'),
  documents: v.array(DocumentSummarySchema)
});

/** A watched document: sent when a client starts watching it, and on every change. */
export const DocumentMessageSchema = v.object({
  type: v.literal('document'),
  stored: StoredDocumentSchema
});

/** A watched document doesn't exist, or has just been deleted. */
export const DocumentMissingMessageSchema = v.object({
  type: v.literal('document-missing'),
  id: DocumentIdSchema
});

/** The outcome of a document request. `id` and `revision` are only present when it succeeded. */
export const DocumentResultMessageSchema = v.object({
  type: v.literal('document-result'),
  requestId: RequestIdSchema,
  status: v.picklist(documentStatuses),
  id: v.optional(DocumentIdSchema),
  revision: v.optional(RevisionSchema)
});

export const ServerMessageSchema = v.variant('type', [
  HelloMessageSchema,
  FrameMessageSchema,
  ActionResultMessageSchema,
  LibraryMessageSchema,
  DocumentMessageSchema,
  DocumentMissingMessageSchema,
  DocumentResultMessageSchema
]);

export type HelloMessage = v.InferOutput<typeof HelloMessageSchema>;
export type FrameMessage = v.InferOutput<typeof FrameMessageSchema>;
export type ActionResultMessage = v.InferOutput<typeof ActionResultMessageSchema>;
export type DocumentResultMessage = v.InferOutput<typeof DocumentResultMessageSchema>;
export type ServerMessage = v.InferOutput<typeof ServerMessageSchema>;

/* ---------------------- Browser → bridge ---------------------- */

export const ActionMessageSchema = v.object({
  type: v.literal('action'),
  requestId: RequestIdSchema,
  action: IdSchema,
  holdMs: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(10_000)))
});

/** Replaces the set of documents this client is sent. */
export const WatchMessageSchema = v.object({
  type: v.literal('watch'),
  ids: v.pipe(v.array(DocumentIdSchema), v.maxLength(16))
});

export const CreateDocumentMessageSchema = v.object({
  type: v.literal('document-create'),
  requestId: RequestIdSchema,
  document: MfdDocumentSchema
});

export const SaveDocumentMessageSchema = v.object({
  type: v.literal('document-save'),
  requestId: RequestIdSchema,
  id: DocumentIdSchema,
  /** The revision the changes were made to. */
  revision: RevisionSchema,
  document: MfdDocumentSchema
});

/** Changes only the name, so a list of documents is enough to rename one. */
export const RenameDocumentMessageSchema = v.object({
  type: v.literal('document-rename'),
  requestId: RequestIdSchema,
  id: DocumentIdSchema,
  revision: RevisionSchema,
  name: MfdDocumentSchema.entries.name
});

export const DuplicateDocumentMessageSchema = v.object({
  type: v.literal('document-duplicate'),
  requestId: RequestIdSchema,
  id: DocumentIdSchema,
  /** The name of the copy. */
  name: MfdDocumentSchema.entries.name
});

export const DeleteDocumentMessageSchema = v.object({
  type: v.literal('document-delete'),
  requestId: RequestIdSchema,
  id: DocumentIdSchema,
  /** The revision the user chose to delete, so newer work is never deleted unseen. */
  revision: RevisionSchema
});

export const DocumentRequestSchema = v.variant('type', [
  CreateDocumentMessageSchema,
  SaveDocumentMessageSchema,
  RenameDocumentMessageSchema,
  DuplicateDocumentMessageSchema,
  DeleteDocumentMessageSchema
]);

export const ClientMessageSchema = v.variant('type', [
  ActionMessageSchema,
  WatchMessageSchema,
  ...DocumentRequestSchema.options
]);

export type ActionMessage = v.InferOutput<typeof ActionMessageSchema>;
export type DocumentRequest = v.InferOutput<typeof DocumentRequestSchema>;
export type ClientMessage = v.InferOutput<typeof ClientMessageSchema>;
