import type { Stop } from './props/Stop.js';

import { Drawer } from '@base-ui/react/drawer';
import { useLayoutEffect, useRef, useState, type PropsWithChildren } from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Text } from '../Text/Text.js';

import * as styles from './Sheet.css.js';

export { stops } from './props/Stop.js';

/** Covers the screen, but lets everything outside the sheet be pressed, unless the sheet is modal. */
const viewportClass = designSystem({
  alignItems: 'flex-end',
  display: 'flex',
  inset: 'none',
  pointerEvents: 'none',
  position: 'fixed'
});

/** Flat, like everything else (0022): darkened, never blurred. */
const backdropClass = [
  designSystem({ backgroundColor: 'backdrop', inset: 'none', position: 'fixed' }),
  styles.backdrop
].join(' ');

/** A step lighter than the page: in a flat design, tone is what says it's on top (0022). */
const popupClass = [
  designSystem({
    backgroundColor: 'surface.raised',
    borderTopColor: 'line.strong',
    borderTopStyle: 'solid',
    borderTopWidth: 'hairline',
    color: 'text',
    display: 'flex',
    flexDirection: 'column',
    height: 'viewport',
    outlineStyle: 'none',
    pointerEvents: 'auto',
    touchAction: 'none',
    width: 'full'
  }),
  styles.popup
].join(' ');

/** Scrolls on its own; the page never does (0007). Children can fill it, to scroll a part of their own. */
const contentClass = designSystem({
  display: 'flex',
  flexDirection: 'column',
  flexBasis: 'auto',
  flexGrow: '1',
  flexShrink: '1',
  minHeight: 'none',
  overflowY: 'auto',
  overscrollBehavior: 'none',
  touchAction: 'auto'
});

/** Until the header is measured: about its height with a mouse. */
const FALLBACK_PEEK_HEIGHT = 64;

/** Fractions of the screen's height, as Base UI's Drawer takes them. */
const snapPoints = { half: 0.5, full: 1 } as const satisfies Record<Stop, number>;

export type SheetProps = PropsWithChildren<{
  /** Where the sheet first rests. The user can drag it to the other stop. */
  defaultStop?: Stop | undefined;
  /**
   * Darkens what's behind it and keeps the user in the sheet until it's closed, e.g. for a side task
   * stacked on another sheet. Pressing the backdrop closes it.
   */
  modal?: boolean | undefined;
  /** Fires when the user closes the sheet: its close button, Escape, or swiping it down. */
  onClose: () => void;
  /** Fires when the user drags a peeking sheet up, or expands it. */
  onOpen?: (() => void) | undefined;
  /** Shows the sheet. It slides in and out as this changes; with `peek`, it slides down to peek. */
  open: boolean;
  /**
   * Closed, the sheet doesn't leave: it rests at the bottom with only its title in view, to be
   * dragged or expanded up again, like a map's sheet. Reserve its room with `SheetPeekSpace`.
   */
  peek?: boolean | undefined;
  title: string;
}>;

/**
 * Takes up as much room as a peeking sheet covers, so the main content can stop above it rather
 * than run underneath. Built like the sheet's header, so the two always match.
 */
export function SheetPeekSpace() {
  return (
    <Box aria-hidden flexShrink='0' paddingBottom='3x'>
      <Box paddingBlock='3x'>
        <Box height='1x' />
      </Box>
      <Box height='control' />
    </Box>
  );
}

/**
 * A sheet that slides up from the bottom of the screen, built on Base UI's Drawer (0003, 0008).
 * It isn't modal: what's above it stays in view and can still be pressed, like a map above a
 * place's details. It rests at half or full height, and only its content scrolls. Opening it
 * focuses the sheet itself, never a field, so no on-screen keyboard covers it until a field is
 * tapped.
 */
export function Sheet({
  children,
  defaultStop = 'half',
  modal = false,
  onClose,
  onOpen,
  open,
  peek = false,
  title
}: SheetProps) {
  const [stop, setStop] = useState<Stop>(defaultStop);
  const [peekHeight, setPeekHeight] = useState(FALLBACK_PEEK_HEIGHT);
  const popupRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;

    if (!peek || !header) {
      return;
    }

    const observer = new ResizeObserver(() => setPeekHeight(header.offsetHeight));

    setPeekHeight(header.offsetHeight);
    observer.observe(header);

    return () => observer.disconnect();
  }, [peek]);

  const peekPoint = `${peekHeight}px`;
  const peeking = peek && !open;

  return (
    <Drawer.Root
      disablePointerDismissal={!modal}
      modal={modal}
      onOpenChange={next => {
        if (!next && open) {
          onClose();
        }
      }}
      onSnapPointChange={point => {
        if (point === null) {
          return;
        }

        if (point === peekPoint) {
          onClose();

          return;
        }

        setStop(point === snapPoints.full ? 'full' : 'half');

        if (!open) {
          onOpen?.();
        }
      }}
      open={open || peek}
      snapPoint={peeking ? peekPoint : snapPoints[stop]}
      snapPoints={peek ? [peekPoint, snapPoints.half, snapPoints.full] : [snapPoints.half, snapPoints.full]}
      // A flick moves one stop at a time (full to half, half to closed), like a map's sheet.
      snapToSequentialPoints
    >
      <Drawer.Portal>
        {modal ? <Drawer.Backdrop className={backdropClass} forceRender /> : null}
        <Drawer.Viewport className={viewportClass}>
          <Drawer.Popup className={popupClass} initialFocus={popupRef} ref={popupRef}>
            {/* Not a button: a drag can't start on one with a mouse. The chevron moves between the stops instead. */}
            <Box flexShrink='0' paddingBottom='3x' ref={headerRef} touchAction='none' userSelect='none'>
              <Box cursor='grab' display='flex' justifyContent='center' paddingBlock='3x'>
                <Box backgroundColor='line.strong' height='1x' width='6x' />
              </Box>
              <Box alignItems='center' display='flex' gap='2x' paddingInline='5x'>
                <Box flexGrow='1' minWidth='none'>
                  <Drawer.Title render={<Text tagName='h2' truncate variant='heading' />}>{title}</Drawer.Title>
                </Box>
                <IconButton
                  icon={peeking || stop === 'half' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  label={peeking || stop === 'half' ? 'Expand' : 'Collapse'}
                  onClick={() => {
                    if (peeking) {
                      onOpen?.();
                    } else {
                      setStop(stop === 'half' ? 'full' : 'half');
                    }
                  }}
                />
                {peeking ? null : <IconButton icon='close' label='Close' onClick={onClose} />}
              </Box>
            </Box>
            <Drawer.Content className={contentClass}>
              <Box flexGrow='1' minHeight='none' paddingBottom='5x' paddingInline='5x' paddingTop='4x'>
                {children}
              </Box>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
