import { useEffect, useId, useRef, type PropsWithChildren } from 'react';

import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import * as styles from './Dialog.css.js';

export type DialogProps = PropsWithChildren<{
  /** Fires when the user dismisses the dialog: Escape, or a press outside it. */
  onClose: () => void;
  title: string;
}>;

/** A modal dialog, open for as long as it's rendered. */
export function Dialog({ children, onClose, title }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Only `showModal` makes a dialog modal; there is no attribute for it.
  useEffect(() => {
    if (ref.current && !ref.current.open) {
      ref.current.showModal();
    }
  }, []);

  return (
    <Box
      aria-labelledby={titleId}
      backgroundColor='elevation.floating'
      borderRadius='2x'
      borderStyle='hidden'
      boxShadow='elevation.floating'
      className={styles.dialog}
      color='body'
      onClose={onClose}
      // The contents cover the dialog, so a press on the dialog itself is on its backdrop.
      onPointerDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      overflowX='hidden'
      overflowY='auto'
      padding='none'
      ref={ref}
      tagName='dialog'
    >
      <Box padding='5x'>
        <Stack spacing='5x'>
          <Text id={titleId} tagName='h2' variant='heading.3'>
            {title}
          </Text>
          {children}
        </Stack>
      </Box>
    </Box>
  );
}
