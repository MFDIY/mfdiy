export const POPOVER_WIDTH = 340;

export const POPOVER_HEIGHT = 420;

/** Distance to its anchor and to the edges of the screen. */
export const POPOVER_MARGIN = 8;

/** In pixels from the top left of the screen. */
export type PopoverPosition = { x: number; y: number };

/** Beside an area of the screen: on its right if there's room, on its left otherwise. */
export function popoverBeside(anchor: { left: number; right: number; top: number }): PopoverPosition {
  const onRight = anchor.right + POPOVER_MARGIN;
  const fits = onRight + POPOVER_WIDTH + POPOVER_MARGIN <= window.innerWidth;

  return { x: fits ? onRight : anchor.left - POPOVER_MARGIN - POPOVER_WIDTH, y: anchor.top };
}
