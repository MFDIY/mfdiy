import type { Stop } from './props/Stop.js';

import { Drawer } from '@base-ui/react/drawer';
import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type RefObject
} from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';

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

/** Flat, like everything else (0022): darkened, never blurred. One per stack of sheets, under all of them. */
const backdropClass = [
  designSystem({ backgroundColor: 'backdrop', inset: 'none', position: 'fixed' }),
  styles.backdrop
].join(' ');

/** What a sheet stacked inside another learns from it. */
type SheetStack = {
  /** Moves the sheets under a stacked one to where it came to rest, so they stay there when it closes. */
  onStop: (stop: Stop) => void;
  /** This sheet and the ones it's stacked on, which follow the top sheet. */
  popups: readonly RefObject<HTMLDivElement | null>[];
  stop: Stop;
};

/** The custom property name in a `var()` from vanilla-extract, to set it on an element. */
const frontOffsetName = styles.frontOffset.slice('var('.length, -1);

const SheetStackContext = createContext<SheetStack | null>(null);

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
    outlineStyle: 'none',
    pointerEvents: 'auto',
    touchAction: 'none',
    width: 'full'
  }),
  styles.popup
].join(' ');

/**
 * Scrolls on its own; the page never does (0007). Children can fill it, to scroll a part of their
 * own. Not while peeking, so a drag anywhere on a peeking sheet moves the sheet.
 */
const contentClass = [
  designSystem({
    display: 'flex',
    flexDirection: 'column',
    flexBasis: 'auto',
    flexGrow: '1',
    flexShrink: '1',
    minHeight: 'none',
    overflowY: 'auto',
    overscrollBehavior: 'none',
    touchAction: 'auto'
  }),
  styles.content
].join(' ');

/** Until the peeking shape is measured: about its height with a mouse. */
const FALLBACK_PEEK_HEIGHT = 64;

/** Fractions of the screen's height, as Base UI's Drawer takes them. */
const snapPoints = { half: 0.5, full: 1 } as const satisfies Record<Stop, number>;

export type SheetProps = PropsWithChildren<{
  /**
   * Where the sheet first rests; the user can drag it to the other stop. A sheet stacked inside
   * another opens where that one rests, unless this says otherwise.
   */
  defaultStop?: Stop | undefined;
  /**
   * Keeps the user in the sheet until it's closed: what's behind it can't be pressed. Alone, it
   * darkens the page, and pressing outside closes it. Stacked inside another sheet, e.g. for a side
   * task, it closes only by its own controls (or by choosing something in it). The sheets under it
   * rise just above it and follow it as it moves, rising half as much again at each level; dragged
   * closed, it leaves them half open. The bottom sheet's backdrop darkens the page under the stack.
   */
  modal?: boolean | undefined;
  /** Fires when the user closes the sheet: Escape, or swiping it down. Content can close it too. */
  onClose: () => void;
  /** Fires when the user drags a peeking sheet up, or presses its handle. */
  onOpen?: (() => void) | undefined;
  /** Shows the sheet. It slides in and out as this changes; with `peek`, it slides down to peek. */
  open: boolean;
  /**
   * Closed, the sheet doesn't leave: it rests at the bottom with its handle and the first row of
   * its content in view, to be dragged up again or opened by pressing the handle, like a map's
   * sheet. Reserve its room with `SheetPeekSpace`.
   */
  peek?: boolean | undefined;
  /** Names the sheet for assistive technology; it isn't shown, so the content can say it instead. */
  title: string;
}>;

/**
 * Takes up as much room as a peeking sheet covers: its handle and the first row of its content,
 * such as a panel's heading and buttons. Put it under the main content, so that stops above the
 * sheet rather than running underneath. The sheet measures the same shape, so the two always match.
 */
export function SheetPeekSpace() {
  return (
    <Box aria-hidden flexShrink='0' paddingBottom='3x'>
      <Box paddingBlock='3x'>
        <Box height='1x' />
      </Box>
      <Box height='control' marginTop='3x' />
    </Box>
  );
}

/**
 * A sheet that slides up from the bottom of the screen, built on Base UI's Drawer (0003, 0008).
 * It isn't modal: what's above it stays in view and can still be pressed, like a map above a
 * place's details. It rests at half or full height, and only its content scrolls. It has no
 * title or buttons of its own, only a handle: it's dragged or flicked between its stops, Escape
 * closes it, and its content closes it where that makes sense (0008). Opening it focuses the sheet
 * itself, never a field, so no on-screen keyboard covers it until a field is tapped.
 */
export function Sheet({
  children,
  defaultStop,
  modal = false,
  onClose,
  onOpen,
  open,
  peek = false,
  title
}: SheetProps) {
  const parent = use(SheetStackContext);
  const startingStop = defaultStop ?? parent?.stop ?? 'half';
  const [stop, setStop] = useState<Stop>(startingStop);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open && parent) {
      setStop(startingStop);
    }
  }

  const nested = parent !== null;
  const ancestors = parent?.popups;
  const [popupElement, setPopupElement] = useState<HTMLDivElement | null>(null);
  const popupCallbackRef = useCallback((element: HTMLDivElement | null) => {
    popupRef.current = element;
    setPopupElement(element);
  }, []);

  function moveTo(next: Stop) {
    setStop(next);
    parent?.onStop(next);
  }

  useLayoutEffect(() => {
    if (!ancestors || !open || !popupElement) {
      return;
    }

    const front = popupElement;

    function follow() {
      if (front.hasAttribute('data-nested-drawer-open')) {
        return;
      }

      const snap = front.style.getPropertyValue('--drawer-snap-point-offset') || '0px';
      const swipe = front.style.getPropertyValue('--drawer-swipe-movement-y') || '0px';

      for (const ancestor of ancestors ?? []) {
        ancestor.current?.style.setProperty(frontOffsetName, `calc(${snap} + ${swipe})`);
      }
    }

    follow();

    const observer = new MutationObserver(follow);

    observer.observe(front, { attributeFilter: ['data-nested-drawer-open', 'style'] });

    return () => observer.disconnect();
  }, [ancestors, open, popupElement]);
  const [peekHeight, setPeekHeight] = useState(FALLBACK_PEEK_HEIGHT);
  const popupRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const shape = peekRef.current;

    if (!peek || !shape) {
      return;
    }

    const observer = new ResizeObserver(() => setPeekHeight(shape.offsetHeight));

    setPeekHeight(shape.offsetHeight);
    observer.observe(shape);

    return () => observer.disconnect();
  }, [peek]);

  const peekPoint = `${peekHeight}px`;
  const peeking = peek && !open;

  return (
    <Drawer.Root
      disablePointerDismissal={!modal || nested}
      modal={modal}
      onOpenChange={(next, details) => {
        if (!next && open) {
          if (details.reason === 'swipe') {
            parent?.onStop('half');
          }

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

        moveTo(point === snapPoints.full ? 'full' : 'half');

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
        {nested ? null : <Drawer.Backdrop className={backdropClass} data-modal={modal ? '' : undefined} />}
        <Drawer.Viewport className={viewportClass}>
          <Drawer.Popup
            aria-label={title}
            className={popupClass}
            data-peeking={peeking ? '' : undefined}
            initialFocus={popupRef}
            ref={popupCallbackRef}
          >
            <Box
              cursor='grab'
              display='flex'
              flexShrink='0'
              justifyContent='center'
              touchAction='none'
              userSelect='none'
            >
              <Box
                aria-label={peeking ? `Open ${title}` : undefined}
                onClick={peeking ? onOpen : undefined}
                onKeyDown={
                  peeking
                    ? event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpen?.();
                        }
                      }
                    : undefined
                }
                paddingBlock='3x'
                paddingInline='6x'
                role={peeking ? 'button' : undefined}
                tabIndex={peeking ? 0 : undefined}
              >
                <Box backgroundColor='line.strong' height='1x' width='6x' />
              </Box>
            </Box>
            <Box pointerEvents='none' position='absolute' ref={peekRef} top='none' width='full'>
              <SheetPeekSpace />
            </Box>
            <Drawer.Content className={contentClass}>
              <Box flexGrow='1' minHeight='none' paddingBottom='5x' paddingInline='5x' paddingTop='3x'>
                <SheetStackContext value={{ onStop: moveTo, popups: [...(ancestors ?? []), popupRef], stop }}>
                  {children}
                </SheetStackContext>
              </Box>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
