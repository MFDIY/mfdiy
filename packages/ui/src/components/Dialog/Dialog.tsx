import { useId, type PropsWithChildren, type ReactNode } from 'react';

import { Box } from '../Box/Box.js';
import { Button } from '../Button/Button.js';
import { Inline } from '../Inline/Inline.js';
import { ScrollContainer } from '../ScrollContainer/ScrollContainer.js';
import { Text } from '../Text/Text.js';

import * as styles from './Dialog.css.js';
import { Modal } from './Modal.js';

export type DialogProps = PropsWithChildren<{
  /** The dialog's buttons. They stay in view while the content scrolls. */
  actions?: ReactNode | undefined;
  /**
   * Shows a close button and lets Escape or a press outside close the dialog. Off by default: the
   * user has to pick one of the actions.
   */
  dismissible?: boolean | undefined;
  /** Fires when the user dismisses a `dismissible` dialog. */
  onClose: () => void;
  title: string;
}>;

/**
 * A modal dialog, open for as long as it's rendered. The title and actions stay put; only the
 * content between them scrolls. It starts with focus on its first field, or on itself, never on
 * a button.
 */
export function Dialog({ actions, children, dismissible = false, onClose, title }: DialogProps) {
  const titleId = useId();

  return (
    <Modal className={styles.dialog} dismissible={dismissible} onClose={onClose} titleId={titleId}>
      <Box className={styles.layout} display='flex' flexDirection='column'>
        <Box alignItems='center' display='flex' gap='4x' justifyContent='space-between' padding='5x'>
          <Text id={titleId} tagName='h2' variant='heading'>
            {title}
          </Text>
          {dismissible ? (
            <Button aria-label='Close' onClick={onClose} variant='quiet'>
              <Box aria-hidden display='block' height='4x' tagName='svg' viewBox='0 0 12 12' width='4x'>
                <Box d='M2 2l8 8M10 2l-8 8' fill='none' stroke='currentColor' strokeWidth='1.5' tagName='path' />
              </Box>
            </Button>
          ) : null}
        </Box>
        {children ? (
          <ScrollContainer>
            <Box paddingBottom={actions ? 'none' : '5x'} paddingInline='5x'>
              {children}
            </Box>
          </ScrollContainer>
        ) : null}
        {actions ? (
          <Box padding='5x'>
            <Inline spacing='3x'>{actions}</Inline>
          </Box>
        ) : null}
      </Box>
    </Modal>
  );
}
