import type { ReactNode } from 'react';

import { Box } from '@mfdiy/ui/components';

import { Frame } from './Frame.js';
import * as styles from './Pressable.css.js';
import { pressHandlers } from './pressHandlers.js';

export const pressStatuses = ['idle', 'pending', 'ok', 'failed'] as const;

/** Where the last press stands: waiting for the game, accepted, or refused (0018). */
export type PressStatus = (typeof pressStatuses)[number];

export type PressableProps = {
  children: ReactNode;
  /** Announces a widget whose page is shown; it looks no different, as that's a signal of its own (0018). */
  current?: boolean | undefined;
  disabled?: boolean | undefined;
  onPress: () => void;
  status?: PressStatus | undefined;
};

/**
 * Makes any widget pressable: it fires on touch (0010) and shows, with corners in the corner box
 * around the widget, that it can be pressed and how the game answered the last press (0018). It
 * has no hover or pressed look, since the MFD is used by touch (0022). Widgets without an action
 * keep the same room in a `CornerBox`, so the two line up.
 */
export function Pressable({ children, current = false, disabled = false, onPress, status = 'idle' }: PressableProps) {
  return (
    <Frame
      {...pressHandlers(onPress, disabled)}
      aria-current={current ? 'page' : undefined}
      className={[styles.cornerBox, styles.pressable]}
      data-status={status}
      disabled={disabled}
      tagName='button'
      touchAction='none'
      type='button'
      userSelect='none'
    >
      {children}
      <Box aria-hidden className={styles.cue} inset='none' pointerEvents='none' position='absolute' />
      <Box aria-hidden className={styles.busy} inset='none' pointerEvents='none' position='absolute' />
    </Frame>
  );
}
