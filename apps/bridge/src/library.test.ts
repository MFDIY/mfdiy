import type { MfdDocument } from '@mfdiy/schema';

import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { openLibrary, type Library, type LibraryChange } from './library.js';

const document = (name: string): MfdDocument => ({
  schema: 1,
  name,
  game: 'test',
  pages: [
    {
      id: 'one',
      name: 'One',
      widgets: [],
      layouts: [{ orientation: 'any', grid: { columns: 4, rows: 4 }, areas: {} }]
    }
  ]
});

let root: string;
let data: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'mfdiy-library-'));
  data = join(root, 'data');
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(root, { recursive: true, force: true });
});

async function create(library: Library, name: string): Promise<string> {
  const { id } = await library.handle({ type: 'document-create', requestId: '1', document: document(name) });

  return id ?? '';
}

describe('openLibrary', () => {
  it('fills a new library, but not one the user emptied', async () => {
    const library = await openLibrary(data, [document('Demo')]);
    const [demo] = library.list();

    expect(demo).toMatchObject({ name: 'Demo', revision: 1, pageCount: 1 });

    await library.handle({ type: 'document-delete', requestId: '1', id: demo?.id ?? '', revision: 1 });

    expect((await openLibrary(data, [document('Demo')])).list()).toEqual([]);
  });

  it('keeps documents across restarts', async () => {
    const library = await openLibrary(data, []);
    const id = await create(library, 'Fighter');

    await library.handle({ type: 'document-save', requestId: '2', id, revision: 1, document: document('Fighter 2') });

    expect((await openLibrary(data, [])).get(id)).toMatchObject({ revision: 2, document: { name: 'Fighter 2' } });
    expect(await readdir(join(data, 'documents'))).toEqual([`${id}.json`]);
  });

  it('skips files it cannot read and leaves them alone', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await openLibrary(data, []);

    const file = join(data, 'documents', 'brokenfile.json');
    await writeFile(file, '{"id": "brokenfile", "document": {"schema": 99}}');

    expect((await openLibrary(data, [])).list()).toEqual([]);
    expect(await readFile(file, 'utf8')).toContain('99');
  });

  it('gives a hand-copied file its own id', async () => {
    const id = await create(await openLibrary(data, []), 'Fighter');
    await writeFile(
      join(data, 'documents', 'handcopied.json'),
      await readFile(join(data, 'documents', `${id}.json`), 'utf8')
    );

    expect(
      (await openLibrary(data, []))
        .list()
        .map(summary => summary.id)
        .sort()
    ).toEqual([id, 'handcopied'].sort());
  });
});

describe('handle', () => {
  it('refuses a save based on an older revision', async () => {
    const library = await openLibrary(data, []);
    const id = await create(library, 'Fighter');
    const save = (name: string) =>
      library.handle({ type: 'document-save', requestId: '1', id, revision: 1, document: document(name) });

    // At the same time, so the second must wait for the first.
    const results = await Promise.all([save('A'), save('B')]);

    expect(results.map(result => result.status)).toEqual(['ok', 'stale']);
    expect(library.get(id)?.document.name).toBe('A');
  });

  it('accepts a repeated save', async () => {
    const library = await openLibrary(data, []);
    const id = await create(library, 'Fighter');
    const save = () =>
      library.handle({ type: 'document-save', requestId: '1', id, revision: 1, document: document('A') });

    await save();

    expect(await save()).toEqual({ status: 'ok', id, revision: 2 });
  });

  it('refuses to rename or delete an older revision', async () => {
    const library = await openLibrary(data, []);
    const id = await create(library, 'Fighter');

    await library.handle({ type: 'document-rename', requestId: '1', id, revision: 1, name: 'Interceptor' });

    expect(await library.handle({ type: 'document-delete', requestId: '2', id, revision: 1 })).toEqual({
      status: 'stale'
    });
    expect(await library.handle({ type: 'document-rename', requestId: '3', id, revision: 1, name: 'Other' })).toEqual({
      status: 'stale'
    });
    expect(library.list()).toMatchObject([{ id, name: 'Interceptor', revision: 2 }]);
  });

  it('duplicates into a new document', async () => {
    const library = await openLibrary(data, []);
    const id = await create(library, 'Fighter');
    const copy = await library.handle({ type: 'document-duplicate', requestId: '1', id, name: 'Fighter copy' });

    expect(copy.id).not.toBe(id);
    expect(library.list().map(summary => summary.name)).toEqual(['Fighter', 'Fighter copy']);
  });

  it('reports documents that do not exist', async () => {
    const library = await openLibrary(data, []);

    expect(await library.handle({ type: 'document-delete', requestId: '1', id: 'doesnotexist', revision: 1 })).toEqual({
      status: 'not-found'
    });
  });

  it('reports a failed write, keeps the saved version and carries on', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const library = await openLibrary(data, []);
    const id = await create(library, 'Fighter');
    const changes: LibraryChange[] = [];
    const rename = (name: string) => library.handle({ type: 'document-rename', requestId: '1', id, revision: 1, name });

    library.subscribe(change => changes.push(change));
    await rm(data, { recursive: true });

    expect(await rename('Lost')).toEqual({ status: 'failed' });
    expect(library.get(id)?.document.name).toBe('Fighter');
    expect(changes).toEqual([]);

    await openLibrary(data, []);

    expect(await rename('Interceptor')).toMatchObject({ status: 'ok' });
    expect(changes).toMatchObject([{ kind: 'changed' }]);
  });
});
