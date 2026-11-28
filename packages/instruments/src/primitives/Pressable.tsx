import { Box } from '@mfdiy/ui/components';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { useRef, useState, type AnimationEvent, type PointerEvent, type ReactNode } from 'react';

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
  /** The action can't be used: its corners dim, and pressing it shows it refused, without sending it. */
  disabled?: boolean | undefined;
  onPress: () => void;
  status?: PressStatus | undefined;
};

const rims = { failed: 'refused', idle: undefined, ok: 'accepted', pending: 'pending' } as const;

/**
 * Makes any widget pressable: it fires on touch (0010) and shows, with corners in the corner box
 * around the widget, that it can be pressed (0018). A tap ripples from the touch point, inside the
 * widget (0022); a rim in the corner box then shows the game's answer. It has no hover or pressed
 * look, since the MFD is used by touch. Widgets without an action keep the same room in a
 * `CornerBox`, so the two line up.
 */
export function Pressable({ children, current = false, disabled = false, onPress, status = 'idle' }: PressableProps) {
  const layer = useRef<HTMLDivElement>(null);
  const [tap, setTap] = useState<{ key: number; x: number; y: number } | null>(null);
  const [refusals, setRefusals] = useState(0);
  const handlers = pressHandlers(disabled ? () => setRefusals(count => count + 1) : onPress);
  const rim = rims[status] ?? (refusals > 0 ? 'refused' : undefined);

  function ripple(event: PointerEvent) {
    const bounds = layer.current?.getBoundingClientRect();

    if (event.button === 0 && bounds) {
      setTap(previous => ({
        key: (previous?.key ?? 0) + 1,
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      }));
    }
  }

  function settle(event: AnimationEvent) {
    if (event.animationName === styles.fade) {
      setRefusals(0);
    }
  }

  return (
    <Frame
      {...handlers}
      aria-current={current ? 'page' : undefined}
      aria-disabled={disabled ? true : undefined}
      className={[styles.cornerBox, styles.pressable]}
      data-rim={rim}
      onPointerDown={event => {
        ripple(event);
        handlers.onPointerDown(event);
      }}
      overflow='visible'
      tagName='button'
      touchAction='none'
      type='button'
      userSelect='none'
    >
      {children}
      <Box aria-hidden className={styles.tapLayer} pointerEvents='none' position='absolute' ref={layer}>
        {tap ? (
          <Box
            className={styles.tap}
            cssVariables={assignInlineVars({ [styles.tapX]: `${tap.x}px`, [styles.tapY]: `${tap.y}px` })}
            key={tap.key}
            onAnimationEnd={() => setTap(null)}
            position='absolute'
          />
        ) : null}
      </Box>
      <Box aria-hidden className={styles.cue} inset='none' pointerEvents='none' position='absolute' />
      <Box
        aria-hidden
        className={styles.rim}
        inset='none'
        key={refusals}
        onAnimationEnd={settle}
        pointerEvents='none'
        position='absolute'
      />
    </Frame>
  );
}
