# 0009: In-place editing on the display

- **Status:** Proposed
- **Date:** 2026-11-24

## Decision

Later, the live display can switch into an **edit mode** for quick tweaks right on the screen in a sim pit:

- A **deliberate, dedicated control** enters edit mode, e.g. an unobtrusive menu button in a corner of the display. Gestures never do (0010). An obvious control exits it.
- A **"lock layout"** setting on the display, on by default, hides the edit control so it can't be opened mid-flight.
- In edit mode, widgets can be moved and resized on the grid, with the same snapping and overlap highlights as the builder (0006).
- Tapping a widget opens the same **properties sheet** as the builder on narrow screens (0008).
- Changes are saved to the same document the builder edits.

Full building (pages, themes, grid size, adding many widgets) stays in the builder; edit mode is for adjustments.

## Why

The screen in a sim pit is where layout problems become obvious: a button too small to hit with a glove, a gauge hard to read from the seat. Fixing it on the spot is much faster than walking back to a PC.

## Consequences

- Cheap to build once the builder exists, because 0008 already requires the canvas, properties and palette to be reusable outside the builder page.
- Entry is a dedicated control rather than a long press, because actions fire on touch (0010) and a long press on a button would already have fired its action.
- Status stays **Proposed** until it is scheduled and the exact entry control is designed.
