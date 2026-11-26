import type { DocumentOutcome } from './DocumentStore.js';

import { MAX_DOCUMENT_NAME_LENGTH } from '@mfdiy/schema';
import { Box, Button, Dialog, Inline, Stack, Text, TextField } from '@mfdiy/ui/components';
import { useState, type FormEvent } from 'react';

import { failureText } from './documentText.js';

type NameDialogProps = {
  initialName?: string;
  onClose: () => void;
  /** Fires once the bridge has accepted the name, with the document's id. */
  onDone: (id: string) => void;
  /** Sends the name to the bridge. */
  onSubmit: (name: string) => Promise<DocumentOutcome>;
  submitLabel: string;
  title: string;
};

/** Asks for a profile's name, and stays open with an explanation if the bridge refuses. */
export function NameDialog({ initialName = '', onClose, onDone, onSubmit, submitLabel, title }: NameDialogProps) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (busy || trimmed === '') {
      return;
    }

    setBusy(true);
    setError(null);

    const outcome = await onSubmit(trimmed);

    setBusy(false);

    if (outcome.status === 'ok') {
      onDone(outcome.id);
    } else {
      setError(failureText[outcome.status]);
    }
  }

  return (
    <Dialog onClose={onClose} title={title}>
      <Box onSubmit={event => void handleSubmit(event)} tagName='form'>
        <Stack spacing='5x'>
          <TextField label='Name' maxLength={MAX_DOCUMENT_NAME_LENGTH} onChange={setName} value={name} />
          {error ? (
            <Text color='status.critical' role='alert' variant='body'>
              {error}
            </Text>
          ) : null}
          <Inline spacing='3x'>
            <Button disabled={busy || trimmed === ''} type='submit' variant='primary'>
              {submitLabel}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </Inline>
        </Stack>
      </Box>
    </Dialog>
  );
}
