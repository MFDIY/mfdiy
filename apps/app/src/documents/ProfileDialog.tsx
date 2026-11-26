import type { DocumentOutcome } from './DocumentStore.js';
import type { DocumentSummary } from '@mfdiy/schema';

import { Button, Dialog, Stack, Text } from '@mfdiy/ui/components';
import { useState } from 'react';

import { useDocumentRequest } from './DocumentsProvider.js';
import { NameDialog } from './NameDialog.js';
import { copyName, failureText } from './documentText.js';

type ProfileDialogProps = {
  onClose: () => void;
  profile: DocumentSummary;
};

/** What can be done with a profile besides showing and editing it. */
export function ProfileDialog({ onClose, profile }: ProfileDialogProps) {
  const request = useDocumentRequest();
  const [step, setStep] = useState<'menu' | 'rename' | { deleteRevision: number }>('menu');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(promise: Promise<DocumentOutcome>) {
    setBusy(true);
    setError(null);

    const outcome = await promise;

    setBusy(false);

    if (outcome.status === 'ok') {
      onClose();
    } else {
      setError(failureText[outcome.status]);
    }
  }

  if (step === 'rename') {
    return (
      <NameDialog
        initialName={profile.name}
        onClose={onClose}
        onDone={onClose}
        onSubmit={name => request({ type: 'document-rename', id: profile.id, revision: profile.revision, name })}
        submitLabel='Rename'
        title={`Rename “${profile.name}”`}
      />
    );
  }

  const failure = error ? (
    <Text color='status.critical' role='alert' variant='body'>
      {error}
    </Text>
  ) : null;

  if (step !== 'menu') {
    return (
      <Dialog
        actions={
          <>
            <Button
              disabled={busy}
              onClick={() =>
                void run(request({ type: 'document-delete', id: profile.id, revision: step.deleteRevision }))
              }
              variant='danger'
            >
              Delete
            </Button>
            <Button onClick={onClose}>Keep</Button>
          </>
        }
        dismissible
        onClose={onClose}
        title={`Delete “${profile.name}”?`}
      >
        <Stack spacing='5x'>
          <Text variant='body'>It’s removed for every device, and can’t be brought back.</Text>
          {failure}
        </Stack>
      </Dialog>
    );
  }

  return (
    <Dialog dismissible onClose={onClose} title={profile.name}>
      <Stack spacing='3x'>
        {failure}
        <Button onClick={() => setStep('rename')} width='full'>
          Rename
        </Button>
        <Button
          disabled={busy}
          onClick={() =>
            void run(request({ type: 'document-duplicate', id: profile.id, name: copyName(profile.name) }))
          }
          width='full'
        >
          Duplicate
        </Button>
        <Button
          onClick={() => {
            setError(null);
            setStep({ deleteRevision: profile.revision });
          }}
          variant='danger'
          width='full'
        >
          Delete
        </Button>
        <Button onClick={onClose} variant='quiet' width='full'>
          Cancel
        </Button>
      </Stack>
    </Dialog>
  );
}
