import { useId, type PropsWithChildren } from 'react';

import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import * as styles from './Dialog.css.js';
import { Modal } from './Modal.js';

export type DialogProps = PropsWithChildren<{
  /** Fires when the user dismisses the dialog: Escape, or a press outside it. */
  onClose: () => void;
  title: string;
}>;

/** A modal dialog, open for as long as it's rendered. */
export function Dialog({ children, onClose, title }: DialogProps) {
  const titleId = useId();

  return (
    <Modal className={styles.dialog} onClose={onClose} titleId={titleId}>
      <Box padding='5x'>
        <Stack spacing='5x'>
          <Text id={titleId} tagName='h2' variant='heading'>
            {title}
          </Text>
          {children}
        </Stack>
      </Box>
    </Modal>
  );
}
