import type { StoredDocument } from '@mfdiy/schema';

import { createBlankDocument } from '@mfdiy/schema';
import { describe, expect, it } from 'vitest';

import { change, changedPageId, isDirty, redo, saved, startEdit, undo } from './edit.js';

const [a, b, c] = ['A', 'B', 'C'].map(name => createBlankDocument(name, 'test')) as [
  StoredDocument['document'],
  StoredDocument['document'],
  StoredDocument['document']
];

const start = startEdit({ id: 'abcdef0123456789', revision: 1, updatedAt: 0, document: a });

describe('undo and redo', () => {
  it('goes back and forth', () => {
    const edit = change(change(start, b), c);

    expect(undo(edit).document).toBe(b);
    expect(undo(undo(edit)).document).toBe(a);
    expect(redo(undo(edit))).toEqual(edit);
  });

  it('does nothing at either end', () => {
    expect(undo(start)).toBe(start);
    expect(redo(start)).toBe(start);
  });

  it('forgets what was undone after a new change', () => {
    expect(change(undo(change(start, b)), c).future).toEqual([]);
  });

  it('keeps a limited number of steps', () => {
    let edit = start;

    for (let step = 0; step < 150; step++) {
      edit = change(edit, step % 2 ? b : c);
    }

    expect(edit.past).toHaveLength(100);
  });
});

describe('isDirty', () => {
  it('follows undo and redo', () => {
    const edit = change(start, b);

    expect(isDirty(start)).toBe(false);
    expect(isDirty(edit)).toBe(true);
    expect(isDirty(undo(edit))).toBe(false);
  });

  it('is measured from the last save, which undo reaches past', () => {
    const edit = saved(change(start, b), b, 2);

    expect(isDirty(edit)).toBe(false);
    expect(isDirty(undo(edit))).toBe(true);
    expect(isDirty(redo(undo(edit)))).toBe(false);
  });

  it('includes changes made while saving', () => {
    const edit = saved(change(change(start, b), c), b, 2);

    expect(isDirty(edit)).toBe(true);
    expect(edit.base.revision).toBe(2);
  });
});

it('finds the page that changed', () => {
  const [page] = a.pages;

  expect(page && changedPageId(a, { ...a, pages: [page, { ...page, id: 'other' }] })).toBe('other');
  expect(changedPageId(a, { ...a, name: 'Renamed' })).toBeUndefined();
});
