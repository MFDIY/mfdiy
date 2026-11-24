# 0009: In-place editing on the display

- **Status:** Proposed
- **Date:** 2026-11-24

## Decision

Later, the live display can switch into an **edit mode** for quick tweaks right on the screen in a sim pit:

- A **long press** on the display enters edit mode (like rearranging app icons on a phone). An obvious control exits it.
- In edit mode, widgets can be moved and resized on the grid, with the same snapping and no-overlap rules as the builder (0006).
- Tapping a widget opens the same **properties sheet** as the builder on narrow screens (0008).
- Changes are saved to the same document the builder edits.

Full building (pages, themes, grid size, adding many widgets) stays in the builder; edit mode is for adjustments.

## Why

The screen in a sim pit is where layout problems become obvious: a button too small to hit with a glove, a gauge hard to read from the seat. Fixing it on the spot is much faster than walking back to a PC.

## Consequences

- Cheap to build once the builder exists, because 0008 already requires the canvas, properties and palette to be reusable outside the builder page.
- The long-press gesture must not interfere with widgets that are pressed for actions, including actions with a hold time. Entering edit mode will likely need a long press on a non-actionable area or a dedicated corner control; decide when building this.
- Status stays **Proposed** until it is scheduled and the entry gesture is settled.
