import type { ReactNode } from 'react';

import { Box } from '@mfdiy/ui/components';

import { Frame } from './Frame.js';
import * as styles from './Pressable.css.js';
import { pressHandlers } from './pressHandlers.js';

export const pressStatuses = ['idle', 'pending', 'ok', 'failed'] as const;

/** Where the last press stands: waiting for the game, accepted, or refused (0018). */
export type PressStatus = (typeof pressStatuses)[number];

/**
 * Temporary: the looks being compared for showing that a widget can be pressed (0018). Inked: over
 * a lit light, the cue takes the light's text colour. Outside: the widget is set in from its cell,
 * and the cue sits around it, never on it.
 */
export const cues = ['corners', 'corners-inked', 'corners-outside', 'frame', 'frame-inked', 'frame-outside'] as const;

export type Cue = (typeof cues)[number];

export type PressableProps = {
  children: ReactNode;
  /** Temporary, while the looks are compared. */
  cue?: Cue | undefined;
  /** Marks a widget whose page is shown (0018). */
  current?: boolean | undefined;
  disabled?: boolean | undefined;
  onPress: () => void;
  status?: PressStatus | undefined;
};

/**
 * Makes any widget pressable: it fires on touch (0010) and shows, with a cue drawn over the widget,
 * that it can be pressed, whether its page is shown, and how the game answered (0018). It has no
 * hover or pressed look, since the MFD is used by touch (0022).
 */
export function Pressable({
  children,
  cue = 'corners',
  current = false,
  disabled = false,
  onPress,
  status = 'idle'
}: PressableProps) {
  return (
    <Frame
      {...pressHandlers(onPress, disabled)}
      aria-current={current ? 'page' : undefined}
      className={styles.pressable}
      data-cue={cue}
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
