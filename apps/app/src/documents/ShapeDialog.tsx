import type { DocumentOutcome } from './DocumentStore.js';
import type { Shape } from '@mfdiy/schema';

import { ShapeField } from '@mfdiy/builder';
import { DEFAULT_SHAPE } from '@mfdiy/schema';
import { Box, Button, Dialog, Stack, Text } from '@mfdiy/ui/components';
import { useId, useState, type FormEvent } from 'react';

import { failureText } from './documentText.js';

type ShapeDialogProps = {
  onClose: () => void;
  /** Fires once the bridge has created the profile, with its id. */
  onDone: (id: string) => void;
  /** Creates the profile in this shape. */
  onSubmit: (shape: Shape) => Promise<DocumentOutcome>;
};

/**
 * Starts a new profile by asking only for its shape (0006); everything else, its name too, is
 * set on the canvas afterwards. Stays open with an explanation if the bridge refuses.
 */
export function ShapeDialog({ onClose, onDone, onSubmit }: ShapeDialogProps) {
  const [shape, setShape] = useState<Shape>(DEFAULT_SHAPE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (busy) {
      return;
    }

    setBusy(true);
    setError(null);

    const outcome = await onSubmit(shape);

    setBusy(false);

    if (outcome.status === 'ok') {
      onDone(outcome.id);
    } else {
      setError(failureText[outcome.status]);
    }
  }

  return (
    <Dialog
      actions={
        <>
          {/* Outside the form, so it names the form it submits. */}
          <Button disabled={busy} form={formId} type='submit' variant='primary'>
            Create
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </>
      }
      dismissible
      onClose={onClose}
      title='New profile'
    >
      <Box id={formId} onSubmit={event => void handleSubmit(event)} tagName='form'>
        <Stack spacing='5x'>
          <Text variant='body'>What shape is the screen it&rsquo;s for?</Text>
          <ShapeField focus onChange={setShape} value={shape} />
          {error ? (
            <Text color='status.critical' role='alert' variant='body'>
              {error}
            </Text>
          ) : null}
        </Stack>
      </Box>
    </Dialog>
  );
}
