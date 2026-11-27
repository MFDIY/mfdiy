import type { WatchedDocument } from '../documents/DocumentStore.js';
import type { Edit } from '../documents/edit.js';
import type { MfdDocument, Page } from '@mfdiy/schema';

import { EditorHeader, PageEditor } from '@mfdiy/builder';
import { pageToken } from '@mfdiy/instruments';
import { addPage, duplicatePage, removePage } from '@mfdiy/schema';
import { Box, Button, Dialog, MenuItem, Text, useToast } from '@mfdiy/ui/components';
import { useRef, useState } from 'react';
import { useBeforeUnload, useBlocker, useNavigate, useParams } from 'react-router';

import { DocumentPlaceholder } from '../documents/DocumentPlaceholder.js';
import { useDocumentRequest, useWatchedDocument } from '../documents/DocumentsProvider.js';
import { NameDialog } from '../documents/NameDialog.js';
import { copyName, failureText } from '../documents/documentText.js';
import { change, changedPageId, isDirty, redo, saved, startEdit, undo } from '../documents/edit.js';
import { MfdWidget } from '../mfd/MfdWidget.js';
import { useConnection } from '../telemetry/TelemetryProvider.js';

export default function Builder() {
  const { id = '' } = useParams();

  return <Editor id={id} key={id} />;
}

/** Says why saving failed, until it's dismissed or saving works. */
const SAVE_FAILED_TOAST = 'save-failed';

/** Shown after deleting a page, with Undo; the id lets it be closed once anything else changes. */
const PAGE_DELETED_TOAST = 'page-deleted';

/**
 * Edits one profile, under its header (0008). Changes stay in the builder until saved; without any,
 * it follows what other devices save.
 */
function Editor({ id }: { id: string }) {
  const watched = useWatchedDocument(id);
  const request = useDocumentRequest();
  const navigate = useNavigate();
  const toast = useToast();

  const { hello } = useConnection();

  const [lastEdit, setEdit] = useState<Edit | null>(null);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<'conflict' | 'save-as-new' | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** A page just duplicated, whose name is focused when it's shown (0023). */
  const [focusNameOf, setFocusNameOf] = useState<string | null>(null);

  // Without unsaved changes there's nothing to keep once another device saves.
  const outdated =
    lastEdit !== null &&
    !isDirty(lastEdit) &&
    watched.status === 'ready' &&
    watched.stored.revision !== lastEdit.base.revision;
  const edit = outdated ? null : lastEdit;
  const dirty = edit !== null && isDirty(edit);

  // Set when leaving on purpose, as the changes are still there until the next render.
  const leavingRef = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !leavingRef.current && currentLocation.pathname !== nextLocation.pathname
  );

  useBeforeUnload(event => {
    if (dirty) {
      event.preventDefault();
    }
  });

  // With unsaved changes, editing continues even if the saved version disappears.
  const stored = watched.status === 'ready' ? watched.stored : dirty ? edit.base : undefined;

  if (!stored) {
    return <DocumentPlaceholder status={watched.status === 'missing' ? 'missing' : 'loading'} />;
  }

  const current = edit ?? startEdit(stored);
  const { document } = current;
  const page = document.pages.find(candidate => candidate.id === pageId) ?? document.pages[0];
  // Version 1 has exactly one layout per page (0006).
  const layout = page?.layouts[0];
  const conflict = saving || !dirty ? null : findConflict(edit, watched);
  const selected = page?.widgets.some(widget => widget.id === selectedId) ? selectedId : null;

  /** Every change but the delete it undoes makes the Undo of a page's delete out of date. */
  function setEditAndDismiss(next: Edit) {
    toast.dismiss(PAGE_DELETED_TOAST);
    setEdit(next);
  }

  function handleChange(next: Page, merge?: string) {
    const pages = document.pages.map(candidate => (candidate.id === next.id ? next : candidate));

    setEditAndDismiss(change(current, { ...document, pages }, merge));
  }

  /** Undoes or redoes, showing the page it changed. */
  function handleTimeTravel(travel: (edit: Edit) => Edit) {
    const next = travel(current);

    setEditAndDismiss(next);
    setPageId(changedPageId(document, next.document) ?? pageId);
  }

  function handlePageChange(next: string) {
    setPageId(next);
    setSelectedId(null);
    setFocusNameOf(null);
  }

  function handleAddPage() {
    const added = addPage(document);

    setEditAndDismiss(change(current, added.document));
    handlePageChange(added.id);
  }

  function handleDuplicatePage(id: string) {
    const duplicated = duplicatePage(document, id);

    setEditAndDismiss(change(current, duplicated.document));
    handlePageChange(duplicated.id);
    setFocusNameOf(duplicated.id);
  }

  /** Deletes at once, with Undo in a toast rather than a question first (0023). */
  function handleDeletePage(deleted: Page) {
    const removed = removePage(document, deleted.id);
    const after = removed.document;

    setEditAndDismiss(change(current, after));
    handlePageChange(removed.id);
    toast.show(`“${deleted.name}” deleted`, {
      action: {
        label: 'Undo',
        onClick: () => {
          setEdit(latest => (latest?.document === after ? undo(latest) : latest));
          setPageId(deleted.id);
        }
      },
      id: PAGE_DELETED_TOAST
    });
  }

  /** Whether everything is saved. */
  async function save(): Promise<boolean> {
    if (!dirty) {
      return true;
    }

    const sent: MfdDocument = edit.document;

    setSaving(true);

    const outcome = await request({
      type: 'document-save',
      id,
      revision: edit.base.revision,
      document: sent
    });

    setSaving(false);

    if (outcome.status === 'ok') {
      toast.dismiss(SAVE_FAILED_TOAST);
      setEdit(latest => latest && saved(latest, sent, outcome.revision));
    } else if (outcome.status === 'stale' || outcome.status === 'not-found') {
      setDialog('conflict');
    } else {
      toast.show(`Not saved. ${failureText[outcome.status]}`, {
        autoDismiss: false,
        dismissible: true,
        id: SAVE_FAILED_TOAST
      });
    }

    return outcome.status === 'ok';
  }

  async function saveAndLeave() {
    if (await save()) {
      blocker.proceed?.();
    } else {
      blocker.reset?.();
    }
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      height='viewport'
      overflow='hidden'
      overscrollBehavior='none'
      tagName='main'
    >
      {page ? (
        <Box
          borderBottomColor='line'
          borderBottomStyle='solid'
          borderBottomWidth='hairline'
          flexShrink='0'
          paddingInline='3x'
          paddingTop='3x'
        >
          <EditorHeader
            accent={pageToken('accent', document.tokens, page.tokens)}
            canRedo={current.future.length > 0}
            canUndo={current.past.length > 0}
            dirty={dirty}
            menu={<MenuItem onClick={() => setDialog('save-as-new')}>Save as new…</MenuItem>}
            name={document.name}
            onAddPage={handleAddPage}
            onBack={() => void navigate('/')}
            onPageChange={handlePageChange}
            onRedo={() => handleTimeTravel(redo)}
            onSave={() => (conflict ? setDialog('conflict') : void save())}
            onUndo={() => handleTimeTravel(undo)}
            pageId={page.id}
            pages={document.pages.map(candidate => ({ label: candidate.name, value: candidate.id }))}
            saving={saving}
          />
        </Box>
      ) : null}
      {/* Padded, so resize handles at the edges of the canvas stay on screen. */}
      <Box flexBasis='fluid' flexGrow='1' minHeight='none' padding='4x'>
        {page && layout ? (
          <PageEditor
            catalogue={hello ?? emptyCatalogue}
            documentTokens={document.tokens}
            focusPageName={focusNameOf === page.id}
            key={page.id}
            layout={layout}
            onChange={handleChange}
            onDeletePage={document.pages.length > 1 ? () => handleDeletePage(page) : undefined}
            onDuplicatePage={() => handleDuplicatePage(page.id)}
            onSelect={setSelectedId}
            page={page}
            renderWidget={widget => <MfdWidget widget={widget} />}
            selectedId={selected}
          />
        ) : null}
      </Box>

      {blocker.state === 'blocked' ? (
        <Dialog
          actions={
            <>
              <Button disabled={saving} onClick={() => void saveAndLeave()} variant='primary'>
                Save
              </Button>
              <Button onClick={() => blocker.proceed()} variant='danger'>
                Discard
              </Button>
              <Button onClick={() => blocker.reset()}>Keep editing</Button>
            </>
          }
          onClose={() => blocker.reset()}
          title={`Save changes to “${document.name}”?`}
        />
      ) : null}

      {dialog === 'conflict' ? (
        <Dialog
          actions={
            <>
              <Button onClick={() => setDialog('save-as-new')} variant='primary'>
                Save as new
              </Button>
              {watched.status === 'ready' ? (
                <Button
                  onClick={() => {
                    setEdit(null);
                    setDialog(null);
                  }}
                  variant='danger'
                >
                  Discard mine
                </Button>
              ) : null}
              <Button onClick={() => setDialog(null)}>Keep editing</Button>
            </>
          }
          onClose={() => setDialog(null)}
          title={
            watched.status === 'missing'
              ? `“${document.name}” has been deleted`
              : `“${document.name}” was changed on another device`
          }
        >
          <Text variant='body'>Your changes aren’t saved, but they’re still here.</Text>
        </Dialog>
      ) : null}

      {dialog === 'save-as-new' ? (
        <NameDialog
          initialName={copyName(document.name)}
          onClose={() => setDialog(null)}
          onDone={newId => {
            leavingRef.current = true;
            void navigate(`/builder/${newId}`);
          }}
          onSubmit={name => request({ type: 'document-create', document: { ...document, name } })}
          submitLabel='Save'
          title='Save as new profile'
        />
      ) : null}
    </Box>
  );
}

/** Until the bridge has announced its own. */
const emptyCatalogue = { signals: [], actions: [] };

type Conflict = 'changed' | 'deleted';

/** What happened to the saved version since these changes were started, if anything. */
function findConflict({ base }: Edit, watched: WatchedDocument): Conflict | null {
  if (watched.status === 'loading') {
    return null;
  }

  if (watched.status === 'missing') {
    return 'deleted';
  }

  return watched.stored.revision > base.revision ? 'changed' : null;
}
