import type { WatchedDocument } from '../documents/DocumentStore.js';
import type { FailedOutcome } from '../documents/documentText.js';
import type { MfdDocument, Page, StoredDocument } from '@mfdiy/schema';

import { Canvas } from '@mfdiy/builder';
import { Box, Button, Dialog, Inline, SegmentedControl, Stack, Text, TextLink } from '@mfdiy/ui/components';
import { useRef, useState } from 'react';
import { useBeforeUnload, useBlocker, useNavigate, useParams } from 'react-router';

import { DocumentPlaceholder } from '../documents/DocumentPlaceholder.js';
import { useDocumentRequest, useWatchedDocument } from '../documents/DocumentsProvider.js';
import { NameDialog } from '../documents/NameDialog.js';
import { copyName, failureText } from '../documents/documentText.js';
import { MfdWidget } from '../mfd/MfdWidget.js';

export default function Builder() {
  const { id = '' } = useParams();

  return <Editor id={id} key={id} />;
}

/** Unsaved changes, and the saved version they were made to. */
type Draft = { document: MfdDocument; base: StoredDocument };

/**
 * Edits one profile. Changes stay in the builder until saved; without any, it follows what other
 * devices save. The rest of the toolbar, palette and properties come next (0008).
 */
function Editor({ id }: { id: string }) {
  const watched = useWatchedDocument(id);
  const request = useDocumentRequest();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<FailedOutcome['status'] | null>(null);
  const [dialog, setDialog] = useState<'conflict' | 'save-as-new' | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Set when leaving on purpose, as the draft is only cleared by the next render.
  const leavingRef = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      draft !== null && !leavingRef.current && currentLocation.pathname !== nextLocation.pathname
  );

  useBeforeUnload(event => {
    if (draft) {
      event.preventDefault();
    }
  });

  // With a draft, editing continues even if the saved version disappears.
  const stored = watched.status === 'ready' ? watched.stored : draft?.base;

  if (!stored) {
    return <DocumentPlaceholder status={watched.status === 'missing' ? 'missing' : 'loading'} />;
  }

  const document = draft?.document ?? stored.document;
  const page = document.pages.find(candidate => candidate.id === pageId) ?? document.pages[0];
  // Version 1 has exactly one layout per page (0006).
  const layout = page?.layouts[0];
  const conflict = saving ? null : findConflict(draft, watched);

  function handleChange(next: Page) {
    setFailure(null);
    setDraft(current => {
      const before = current?.document ?? document;
      const pages = before.pages.map(candidate => (candidate.id === next.id ? next : candidate));

      return { document: { ...before, pages }, base: current?.base ?? (stored as StoredDocument) };
    });
  }

  function handlePageChange(next: string) {
    setPageId(next);
    setSelectedId(null);
  }

  /** Whether everything is saved. */
  async function save(): Promise<boolean> {
    if (!draft) {
      return true;
    }

    setSaving(true);
    setFailure(null);

    const outcome = await request({
      type: 'document-save',
      id,
      revision: draft.base.revision,
      document: draft.document
    });

    setSaving(false);

    if (outcome.status === 'ok') {
      const base = { ...draft.base, revision: outcome.revision, document: draft.document };

      // Changes made while saving are still unsaved.
      setDraft(current => (current && current.document !== draft.document ? { ...current, base } : null));
    } else if (outcome.status === 'stale' || outcome.status === 'not-found') {
      setDialog('conflict');
    } else {
      setFailure(outcome.status);
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
      <Box padding='3x'>
        <Inline alignItems='center' justifyContent='space-between' spacing='4x'>
          <Inline alignItems='center' spacing='4x'>
            <Text variant='body'>
              <TextLink to='/'>Back</TextLink>
            </Text>
            <Text tagName='h1' variant='heading.4'>
              {document.name}
            </Text>
            {page && document.pages.length > 1 ? (
              <SegmentedControl
                onChange={handlePageChange}
                options={document.pages.map(candidate => ({ label: candidate.name, value: candidate.id }))}
                value={page.id}
              />
            ) : null}
          </Inline>
          <Inline alignItems='center' spacing='3x'>
            <Text role='status' variant={failure || conflict ? 'field.error' : 'deemphasized'}>
              {saving
                ? 'Saving…'
                : failure
                  ? `Not saved. ${failureText[failure]}`
                  : conflict
                    ? conflictText[conflict]
                    : draft
                      ? 'Unsaved changes'
                      : 'Saved'}
            </Text>
            <Button onClick={() => setDialog('save-as-new')} size='large'>
              Save as new
            </Button>
            <Button
              disabled={!draft || saving}
              onClick={() => (conflict ? setDialog('conflict') : void save())}
              size='large'
              variant='attention'
            >
              Save
            </Button>
          </Inline>
        </Inline>
      </Box>
      {/* Padded, so resize handles at the edges of the canvas stay on screen. */}
      <Box flexBasis='fluid' flexGrow='1' minHeight='none' padding='4x'>
        {page && layout ? (
          <Canvas
            documentTokens={document.tokens}
            key={page.id}
            layout={layout}
            onChange={handleChange}
            onSelect={setSelectedId}
            page={page}
            renderWidget={widget => <MfdWidget widget={widget} />}
            selectedId={selectedId}
          />
        ) : null}
      </Box>

      {blocker.state === 'blocked' ? (
        <Dialog onClose={() => blocker.reset()} title={`Save changes to “${document.name}”?`}>
          <Inline spacing='3x'>
            <Button disabled={saving} onClick={() => void saveAndLeave()} size='large' variant='attention'>
              Save
            </Button>
            <Button onClick={() => blocker.proceed()} size='large' variant='destructive'>
              Discard
            </Button>
            <Button onClick={() => blocker.reset()} size='large'>
              Keep editing
            </Button>
          </Inline>
        </Dialog>
      ) : null}

      {dialog === 'conflict' ? (
        <Dialog
          onClose={() => setDialog(null)}
          title={
            watched.status === 'missing'
              ? `“${document.name}” has been deleted`
              : `“${document.name}” was changed on another device`
          }
        >
          <Stack spacing='5x'>
            <Text variant='body'>Your changes aren’t saved, but they’re still here.</Text>
            <Inline spacing='3x'>
              <Button onClick={() => setDialog('save-as-new')} size='large' variant='attention'>
                Save as new
              </Button>
              {watched.status === 'ready' ? (
                <Button
                  onClick={() => {
                    setDraft(null);
                    setFailure(null);
                    setDialog(null);
                  }}
                  size='large'
                  variant='destructive'
                >
                  Discard mine
                </Button>
              ) : null}
              <Button onClick={() => setDialog(null)} size='large'>
                Keep editing
              </Button>
            </Inline>
          </Stack>
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

const conflictText = {
  changed: 'Changed on another device',
  deleted: 'Deleted on another device'
} as const;

/** What happened to the saved version since the draft was started, if anything. */
function findConflict(draft: Draft | null, watched: WatchedDocument): keyof typeof conflictText | null {
  if (!draft || watched.status === 'loading') {
    return null;
  }

  if (watched.status === 'missing') {
    return 'deleted';
  }

  return watched.stored.revision > draft.base.revision ? 'changed' : null;
}
