import {
  DocumentIdSchema,
  migrateDocument,
  StoredDocumentSchema,
  summariseDocument,
  type DocumentRequest,
  type DocumentStatus,
  type DocumentSummary,
  type MfdDocument,
  type StoredDocument
} from '@mfdiy/schema';
import { randomBytes } from 'node:crypto';
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import * as v from 'valibot';

/**
 * Documents saved by an older version are migrated in memory when loaded, and written in the
 * current format the next time they change.
 */
function migrateStored(stored: unknown): unknown {
  return typeof stored === 'object' && stored !== null && 'document' in stored
    ? { ...stored, document: migrateDocument(stored.document) }
    : stored;
}

/** Far beyond what anyone makes by hand; stops a runaway client filling the disk. */
const MAX_DOCUMENTS = 500;

export type LibraryResult = { status: DocumentStatus; id?: string; revision?: number };

export type LibraryChange = { kind: 'changed'; stored: StoredDocument } | { kind: 'deleted'; id: string };

export type Library = {
  list(): DocumentSummary[];
  get(id: string): StoredDocument | undefined;
  /** Never throws: whatever goes wrong is the result's status. */
  handle(request: DocumentRequest): Promise<LibraryResult>;
  /** Called after a change is on disk. Returns an unsubscribe function. */
  subscribe(listener: (change: LibraryChange) => void): () => void;
};

/** Where this operating system keeps an app's data. */
export function defaultDataDirectory(): string {
  switch (process.platform) {
    case 'win32':
      return join(process.env['APPDATA'] ?? join(homedir(), 'AppData', 'Roaming'), 'MFDIY');
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', 'MFDIY');
    default:
      return join(process.env['XDG_DATA_HOME'] ?? join(homedir(), '.local', 'share'), 'mfdiy');
  }
}

/**
 * Saved documents, one JSON file each. Everything is kept in memory too, and files are only ever
 * named after ids from memory, so nothing a client sends becomes part of a path.
 *
 * @param starters What to fill a new library with: only when the folder doesn't exist yet, so
 *   documents the user deletes stay deleted.
 */
export async function openLibrary(dataDirectory: string, starters: readonly MfdDocument[]): Promise<Library> {
  const directory = join(dataDirectory, 'documents');
  const documents = new Map<string, StoredDocument>();
  const listeners = new Set<(change: LibraryChange) => void>();
  let queue: Promise<unknown> = Promise.resolve();

  const path = (id: string) => join(directory, `${id}.json`);

  async function load() {
    for (const file of await readdir(directory)) {
      const id = file.replace(/\.json$/, '');

      if (id === file || !v.is(DocumentIdSchema, id)) {
        continue;
      }

      try {
        const stored = v.parse(
          StoredDocumentSchema,
          migrateStored(JSON.parse(await readFile(join(directory, file), 'utf8')))
        );

        // A file copied by hand carries the original's id; the file name is the one that's unique.
        documents.set(id, { ...stored, id });
      } catch (error) {
        // Left alone: it may be from a newer version, or fixable by hand.
        console.warn(`Skipped ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /** Writes to a temporary file first, so a crash halfway never damages the saved document. */
  async function write(stored: StoredDocument): Promise<LibraryResult> {
    const temporary = `${path(stored.id)}.tmp`;

    await writeFile(temporary, `${JSON.stringify(stored, null, 2)}\n`, { flush: true });
    await rename(temporary, path(stored.id));

    documents.set(stored.id, stored);
    notify({ kind: 'changed', stored });

    return { status: 'ok', id: stored.id, revision: stored.revision };
  }

  function notify(change: LibraryChange) {
    for (const listener of listeners) {
      listener(change);
    }
  }

  async function create(document: MfdDocument): Promise<LibraryResult> {
    if (documents.size >= MAX_DOCUMENTS) {
      return { status: 'full' };
    }

    return await write({ id: randomBytes(8).toString('hex'), revision: 1, updatedAt: Date.now(), document });
  }

  async function update(current: StoredDocument, document: MfdDocument): Promise<LibraryResult> {
    return await write({ ...current, revision: current.revision + 1, updatedAt: Date.now(), document });
  }

  async function perform(request: DocumentRequest): Promise<LibraryResult> {
    if (request.type === 'document-create') {
      return await create(request.document);
    }

    const current = documents.get(request.id);

    if (!current) {
      return { status: 'not-found' };
    }

    if (request.type === 'document-duplicate') {
      return await create({ ...current.document, name: request.name });
    }

    if (request.type === 'document-save' && isDeepStrictEqual(request.document, current.document)) {
      // Nothing to save, or a retry after the first attempt's answer got lost.
      return { status: 'ok', id: current.id, revision: current.revision };
    }

    if (request.revision !== current.revision) {
      return { status: 'stale' };
    }

    switch (request.type) {
      case 'document-save':
        return await update(current, request.document);

      case 'document-rename':
        return await update(current, { ...current.document, name: request.name });

      case 'document-delete':
        await rm(path(current.id), { force: true });
        documents.delete(current.id);
        notify({ kind: 'deleted', id: current.id });

        return { status: 'ok', id: current.id, revision: current.revision };
    }
  }

  /** One request at a time, so a revision can't change between checking it and writing. */
  function handle(request: DocumentRequest): Promise<LibraryResult> {
    const result = queue.then(() =>
      perform(request).catch((error: unknown): LibraryResult => {
        console.error(`Could not handle ${request.type}:`, error);

        return { status: 'failed' };
      })
    );

    queue = result;

    return result;
  }

  const isNew = (await mkdir(directory, { recursive: true })) !== undefined;

  await load();

  if (isNew) {
    for (const starter of starters) {
      await create(starter);
    }
  }

  return {
    list: () => [...documents.values()].map(summariseDocument),
    get: id => documents.get(id),
    handle,
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    }
  };
}
