import * as v from 'valibot';

import { MfdDocumentSchema } from './document.js';

/*
 * The library of saved documents (called profiles in the interface). It lives on the bridge, so
 * every device on the network shares it. See docs/decisions/0019.
 */

/** Given out by the bridge, and also the document's file name, hence the narrow format. */
export const DocumentIdSchema = v.pipe(v.string(), v.regex(/^[a-z0-9]{8,32}$/));

/** Goes up by one with every change, so a save based on an older version can be refused. */
export const RevisionSchema = v.pipe(v.number(), v.safeInteger(), v.minValue(1));

/** A saved document as the bridge stores and sends it. */
export const StoredDocumentSchema = v.object({
  id: DocumentIdSchema,
  revision: RevisionSchema,
  /** Milliseconds since the Unix epoch. */
  updatedAt: v.number(),
  document: MfdDocumentSchema
});

export type StoredDocument = v.InferOutput<typeof StoredDocumentSchema>;

/** Enough to list a document without sending all of it. */
export const DocumentSummarySchema = v.object({
  id: DocumentIdSchema,
  revision: RevisionSchema,
  updatedAt: v.number(),
  name: MfdDocumentSchema.entries.name,
  game: MfdDocumentSchema.entries.game,
  pageCount: v.pipe(v.number(), v.integer(), v.minValue(1))
});

export type DocumentSummary = v.InferOutput<typeof DocumentSummarySchema>;

export function summariseDocument({ id, revision, updatedAt, document }: StoredDocument): DocumentSummary {
  return { id, revision, updatedAt, name: document.name, game: document.game, pageCount: document.pages.length };
}
