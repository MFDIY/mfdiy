import type { MfdDocument, StoredDocument } from '@mfdiy/schema';

/** How far back undo goes. */
const MAX_UNDO_STEPS = 100;

/** A document being edited. Saving doesn't clear its history, so undo reaches past a save. */
export type Edit = {
  /** The saved version these changes were made to. */
  base: StoredDocument;
  past: readonly MfdDocument[];
  document: MfdDocument;
  future: readonly MfdDocument[];
  /** Names the run of typing the last change belonged to, if any (0023). */
  merge?: string | undefined;
};

export function startEdit(base: StoredDocument): Edit {
  return { base, past: [], document: base.document, future: [] };
}

/** Whether there are changes to save. Undoing all of them counts as none. */
export function isDirty(edit: Edit): boolean {
  return edit.document !== edit.base.document;
}

/** A change; one with the same `merge` as the last is part of the same undo step (0023). */
export function change(edit: Edit, document: MfdDocument, merge?: string): Edit {
  if (merge !== undefined && merge === edit.merge) {
    return { ...edit, document, future: [] };
  }

  return { ...edit, past: [...edit.past, edit.document].slice(-MAX_UNDO_STEPS), document, future: [], merge };
}

export function undo(edit: Edit): Edit {
  const document = edit.past.at(-1);

  return document
    ? { ...edit, past: edit.past.slice(0, -1), document, future: [edit.document, ...edit.future], merge: undefined }
    : edit;
}

export function redo(edit: Edit): Edit {
  const [document, ...future] = edit.future;

  return document ? { ...edit, past: [...edit.past, edit.document], document, future, merge: undefined } : edit;
}

/** After `document` was saved as `revision`. Changes made in the meantime are still unsaved. */
export function saved(edit: Edit, document: MfdDocument, revision: number): Edit {
  return { ...edit, base: { ...edit.base, document, revision } };
}

/** The first page that differs, so undo and redo can show what they changed. */
export function changedPageId(before: MfdDocument, after: MfdDocument): string | undefined {
  return after.pages.find(page => !before.pages.includes(page))?.id;
}
