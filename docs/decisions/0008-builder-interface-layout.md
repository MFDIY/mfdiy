# 0008: Builder interface layout

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

The canvas fills the whole screen only on the **display**. In the **builder**, the canvas is one part of the interface and is fitted into the space the builder's controls leave. Because layouts stretch (0006), editing on a canvas of a different size or shape is fine; the **preview switcher** shows the real shape when needed.

### Wide screens (desktop, tablet landscape)

- **Top toolbar** (slim): page tabs, preview shape, zoom, undo / redo, preview toggle.
- **Properties panel** on the right for the selected widget: bindings, options, action, theme overrides, position and size.
- **Canvas** fills the rest, centred and fitted to the preview shape.
- **No permanent widget palette.** Tapping or clicking an empty cell opens the palette there (see "Add" in 0006).

### Narrow screens (phones)

- The canvas takes almost the whole screen, under a thin toolbar.
- Selecting a widget opens a **bottom sheet** with its properties. Half-open it shows the essentials and keeps the selected widget visible above it, zooming to it if needed; dragged up it shows the full panel.
- Tapping an empty cell opens the **palette** in the same kind of sheet.

### Preview mode

A toggle hides all builder controls and shows the layout full-screen with live data, exactly as the display will render it.

## Why

- Keeps the canvas as large as possible on every device while giving properties a natural home: a panel where there is room, a sheet where there isn't.
- Bottom sheets are a familiar pattern on phones and keep the selected widget in view while it's edited.
- Opening the palette at the tapped cell is faster on touch than dragging from a sidebar, and avoids a permanent panel competing for space.

## Consequences

- The **canvas component fits any box** it's given; it doesn't assume it owns the viewport.
- **Properties and palette are written once** and presented as either a side panel or a bottom sheet depending on available width (container queries, not device detection).
- The builder needs a bottom-sheet component in `packages/ui` that works with touch, mouse and keyboard and respects 0007 (no page scrolling; the sheet's own content may scroll, as it's builder UI, not MFD content).
- The canvas, properties and palette must not depend on the surrounding builder page, so they can be reused for in-place editing (0009).
