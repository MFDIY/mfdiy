import type { PopoverPosition } from './geometry.js';

import { useId, type CSSProperties, type PropsWithChildren, type ReactNode } from 'react';

import { Box } from '../Box/Box.js';
import { Modal } from '../Dialog/Modal.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import * as styles from './Popover.css.js';

export type PopoverProps = PropsWithChildren<{
  /** Shown beside the title, e.g. a button to go back. */
  action?: ReactNode;
  /** Fires when the user dismisses it: Escape, or a press outside it. */
  onClose: () => void;
  /** See `popoverBeside`. Only used where there's room for a popover. */
  position: PopoverPosition;
  title: string;
}>;

/**
 * A panel beside what it's about or, in a narrow container, a sheet at the bottom of the screen. Its
 * own contents may scroll (0008). Open for as long as it's rendered.
 */
export function Popover({ action, children, onClose, position, title }: PopoverProps) {
  const titleId = useId();

  const style: CSSProperties = {
    [cssName(styles.x)]: `${position.x}px`,
    [cssName(styles.y)]: `${position.y}px`
  };

  return (
    <Modal className={styles.popover} onClose={onClose} style={style} titleId={titleId}>
      <Box minHeight='full' padding='4x'>
        <Stack spacing='4x'>
          <Inline alignItems='center' spacing='3x'>
            {action}
            <Text id={titleId} tagName='h2' variant='heading.4'>
              {title}
            </Text>
          </Inline>
          {children}
        </Stack>
      </Box>
    </Modal>
  );
}

/** `var(--name)` to `--name`. */
function cssName(variable: string): string {
  return variable.slice('var('.length, -1);
}
