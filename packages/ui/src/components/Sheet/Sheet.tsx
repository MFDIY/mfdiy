import type { Stop } from './props/Stop.js';

import { Drawer } from '@base-ui/react/drawer';
import { useRef, useState, type PropsWithChildren } from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Button } from '../Button/Button.js';
import { Text } from '../Text/Text.js';

import * as styles from './Sheet.css.js';

export { stops } from './props/Stop.js';

/** Covers the screen, but lets everything outside the sheet be pressed: the sheet is not modal. */
const viewportClass = designSystem({
  alignItems: 'flex-end',
  display: 'flex',
  inset: 'none',
  pointerEvents: 'none',
  position: 'fixed'
});

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

/** Fractions of the screen's height, as Base UI's Drawer takes them. */
const snapPoints = { half: 0.5, full: 1 } as const satisfies Record<Stop, number>;

export type SheetProps = PropsWithChildren<{
  /** Shows the sheet. It slides in and out as this changes. */
  open: boolean;
  /** Fires when the user closes the sheet: its close button, Escape, or swiping it down. */
  onClose: () => void;
  /** Where the sheet first rests. The user can drag it to the other stop. */
  defaultStop?: Stop | undefined;
  title: string;
}>;

/**
 * A sheet that slides up from the bottom of the screen, built on Base UI's Drawer (0003, 0008).
 * It isn't modal: what's above it stays in view and can still be pressed, like a map above a
 * place's details. It rests at half or full height, and only its content scrolls. Opening it
 * focuses the sheet itself, never a field, so no on-screen keyboard covers it until a field is
 * tapped.
 */
export function Sheet({ children, defaultStop = 'half', onClose, open, title }: SheetProps) {
  const [stop, setStop] = useState<Stop>(defaultStop);
  const popupRef = useRef<HTMLDivElement>(null);

  return (
    <Drawer.Root
      disablePointerDismissal
      modal={false}
      onOpenChange={next => {
        if (!next) {
          onClose();
        }
      }}
      onSnapPointChange={point => {
        if (point !== null) {
          setStop(point === snapPoints.full ? 'full' : 'half');
        }
      }}
      open={open}
      snapPoint={snapPoints[stop]}
      snapPoints={[snapPoints.half, snapPoints.full]}
      // A flick moves one stop at a time (full to half, half to closed), like a map's sheet.
      snapToSequentialPoints
    >
      <Drawer.Portal>
        <Drawer.Viewport className={viewportClass}>
          <Drawer.Popup className={popupClass} initialFocus={popupRef} ref={popupRef}>
            {/* Not a button: a drag can't start on one with a mouse. The chevron moves between the stops instead. */}
            <Box flexShrink='0' touchAction='none' userSelect='none'>
              <Box cursor='grab' display='flex' justifyContent='center' paddingBlock='3x'>
                <Box backgroundColor='line.strong' height='1x' width='6x' />
              </Box>
              <Box alignItems='center' display='flex' gap='2x' paddingInline='5x'>
                <Box flexGrow='1' minWidth='none'>
                  <Drawer.Title render={<Text tagName='h2' truncate variant='heading' />}>{title}</Drawer.Title>
                </Box>
                <Button
                  aria-label={stop === 'half' ? 'Expand' : 'Collapse'}
                  onClick={() => setStop(stop === 'half' ? 'full' : 'half')}
                  variant='quiet'
                >
                  <Box aria-hidden display='block' height='4x' tagName='svg' viewBox='0 0 12 12' width='4x'>
                    <Box
                      d={stop === 'half' ? 'M2 8l4-4 4 4' : 'M2 4l4 4 4-4'}
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      tagName='path'
                    />
                  </Box>
                </Button>
                <Button aria-label='Close' onClick={onClose} variant='quiet'>
                  <Box aria-hidden display='block' height='4x' tagName='svg' viewBox='0 0 12 12' width='4x'>
                    <Box d='M2 2l8 8M10 2l-8 8' fill='none' stroke='currentColor' strokeWidth='1.5' tagName='path' />
                  </Box>
                </Button>
              </Box>
            </Box>
            <Drawer.Content className={contentClass}>
              <Box flexGrow='1' minHeight='none' padding='5x'>
                {children}
              </Box>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
