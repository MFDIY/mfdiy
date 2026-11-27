import { createContext, use, type RefObject } from 'react';

/** The open modal dialog that popups inside it render into, if any. */
export const PopupLayerContext = createContext<RefObject<HTMLElement | null> | null>(null);

/**
 * Where a popup (menu, select, tooltip, toggletip) renders, as props for Base UI's Portal and
 * Positioner. A modal dialog is in the browser's top layer, above everything at the end of the page
 * whatever its z-index, so popups inside one render into it instead, positioned against the screen
 * so the dialog's own clipping doesn't cut them off. Elsewhere they render at the end of the page.
 */
export function usePopupLayer() {
  const container = use(PopupLayerContext);

  return {
    portal: { container: container ?? undefined },
    positioner: { positionMethod: container ? ('fixed' as const) : ('absolute' as const) }
  };
}
