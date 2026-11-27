import { createContext, use, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { useMatchesMediaQuery } from '../../hooks/useMatchesMediaQuery/useMatchesMediaQuery.js';
import { Box } from '../Box/Box.js';
import { ScrollContainer } from '../ScrollContainer/ScrollContainer.js';
import { Sheet, SheetPeekSpace } from '../Sheet/Sheet.js';

export const panelForms = ['sidebars', 'sheets'] as const;

/** How the panels show: docked beside the main content, or as sheets over it. */
export type PanelForm = (typeof panelForms)[number];

export const panelSides = ['start', 'end'] as const;

export type PanelSide = (typeof panelSides)[number];

export type Panel = {
  content: ReactNode;
  /**
   * As a sheet, closing it leaves its title in view at the bottom, to drag up again (0008), and
   * the main content stops above it. For a panel that always has something to show, like properties.
   */
  peek?: boolean | undefined;
  /** Names the sheet for assistive technology. */
  title: string;
};

/** The room the panels need to dock beside the main content, in pixels: both, and a usable canvas. */
const SIDEBARS_MIN_WIDTH = 1100;

const PanelFormContext = createContext<PanelForm>('sidebars');

/** Whether the panels around this are sidebars or sheets, e.g. to only allow dragging out of a sidebar. */
export function usePanelForm(): PanelForm {
  return use(PanelFormContext);
}

export type PanelLayoutProps = {
  /** The main content, e.g. the canvas. */
  children: ReactNode;
  /** The panel after the main content, e.g. a widget's properties. */
  end?: Panel | undefined;
  /** Fires when the open sheet is closed: its close button, Escape, or swiping it down. */
  onSheetClose: () => void;
  /** Fires when the user drags a peeking sheet up, or expands it. */
  onSheetOpen?: ((side: PanelSide) => void) | undefined;
  /** Which panel shows as a sheet, when they are sheets; only one at a time. Sidebars ignore it. */
  openSheet: PanelSide | null;
  /** The panel before the main content, e.g. the widget library. */
  start?: Panel | undefined;
};

/**
 * Main content with a panel on either side, written once and shown in the form that suits the
 * screen (0008): sidebars with a mouse or pen and room for them, sheets otherwise, both switching
 * together. Sidebars have a fixed width and a hairline towards the main content, and pad and scroll
 * their content, with the scrollbar at their edge; content doesn't scroll itself. As sheets, the page
 * decides which one is open, so there's only ever one.
 */
export function PanelLayout({ children, end, onSheetClose, onSheetOpen, openSheet, start }: PanelLayoutProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const hasFinePointer = useMatchesMediaQuery('(any-pointer: fine)');

  useLayoutEffect(() => {
    setWidth(rootRef.current?.getBoundingClientRect().width ?? null);
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? null));

    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  const form: PanelForm = hasFinePointer && width !== null && width >= SIDEBARS_MIN_WIDTH ? 'sidebars' : 'sheets';
  const panels = (
    [
      ['start', start],
      ['end', end]
    ] as const
  ).filter((entry): entry is readonly [PanelSide, Panel] => entry[1] !== undefined);
  const peeking = form === 'sheets' && panels.some(([, panel]) => panel.peek);

  return (
    <PanelFormContext value={form}>
      <Box display='flex' gap='4x' height='full' minWidth='none' ref={rootRef} width='full'>
        {form === 'sidebars' && start ? <Sidebar side='start'>{start.content}</Sidebar> : null}
        <Box display='flex' flexDirection='column' flexGrow='1' height='full' minWidth='none'>
          <Box flexGrow='1' minHeight='none'>
            {children}
          </Box>
          {peeking ? <SheetPeekSpace /> : null}
        </Box>
        {form === 'sidebars' && end ? <Sidebar side='end'>{end.content}</Sidebar> : null}
        {form === 'sheets'
          ? panels
              .toSorted(([, a], [, b]) => Number(Boolean(b.peek)) - Number(Boolean(a.peek)))
              .map(([side, panel]) => (
                <Sheet
                  key={side}
                  onClose={onSheetClose}
                  onOpen={() => onSheetOpen?.(side)}
                  open={openSheet === side}
                  peek={panel.peek}
                  title={panel.title}
                >
                  {panel.content}
                </Sheet>
              ))
          : null}
      </Box>
    </PanelFormContext>
  );
}

function Sidebar({ children, side }: { children: ReactNode; side: PanelSide }) {
  return (
    <Box
      borderLeftColor={side === 'end' ? 'line' : undefined}
      borderLeftStyle={side === 'end' ? 'solid' : undefined}
      borderLeftWidth={side === 'end' ? 'hairline' : undefined}
      borderRightColor={side === 'start' ? 'line' : undefined}
      borderRightStyle={side === 'start' ? 'solid' : undefined}
      borderRightWidth={side === 'start' ? 'hairline' : undefined}
      display='flex'
      flexDirection='column'
      flexShrink='0'
      height='full'
      minHeight='none'
      tagName='aside'
      width='panel'
    >
      <ScrollContainer>
        <Box
          backgroundColor='surface'
          paddingLeft={side === 'end' ? '4x' : undefined}
          paddingRight={side === 'start' ? '4x' : undefined}
        >
          {children}
        </Box>
      </ScrollContainer>
    </Box>
  );
}
