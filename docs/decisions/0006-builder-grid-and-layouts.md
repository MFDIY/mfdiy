# 0006: Builder grid, layouts and interaction

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

### A stretching grid of cells

- Each page layout is a grid of **columns × rows** that the user chooses. A new page gets a sensible default; the grid can be changed at any time.
- The grid **stretches** to fill whatever screen it is shown on. Cells become rectangles on screens of a different shape; that's an accepted side effect of being fully responsive (0001). Widgets cope through container queries.
- Widgets snap to the grid: position and size are always whole cells. The builder shows the cell corners as a **dot grid**.
- When the grid size changes after widgets are placed, widget positions and sizes are **scaled proportionally**, then collisions caused by rounding are resolved, rather than clipping widgets at the new edge.
- There is **no stored target screen size**. Instead the builder offers a **preview switcher** (phone portrait, tablet landscape, square panel, ...) that changes the canvas shape without changing the layout.

### Layouts per page, orientation variants later

- A page's widgets (type, options, bindings, action, theme overrides) are separate from their placement. Placement lives in the page's **layouts**: each layout has a grid and an area per widget.
- Version 1 has exactly one layout per page, matching any orientation.
- Later, a page can add a **portrait** and/or **landscape** variant. Orientation, not width breakpoints, is the breakpoint that matters for MFDs. Variants share the widgets, so a widget is configured once and only placed differently. The display picks the layout matching its orientation and falls back to the first layout, stretched.
- The document format supports multiple layouts from the start, so adding variants later needs no migration.

### No overlap

Widgets in a layout may not overlap, and must lie within the grid. The builder shows invalid positions while dragging and refuses to drop there. The schema enforces the same rules for documents loaded from elsewhere. Layered widgets (e.g. a label over a gauge) may relax this later as an explicit feature.

### Own pointer code

Drag, drop and resize are built in-house on **Pointer Events** with `setPointerCapture`, not with a drag-and-drop library. Grid snapping and resizing are a small amount of code, and owning it keeps touch, pen and mouse behaviour fully under our control.

### Interaction

- **Move:** drag a widget; a snapped ghost previews the drop, red where it's invalid.
- **Resize:** corner and edge handles, at least 44 px on touch screens, never below the widget manifest's `minSize`.
- **Add:** tap an empty cell, pick a widget from a palette, and it's placed there at its default size (shrunk to fit if needed).
- **Touch screens:** widgets can be dragged directly, since nothing scrolls (0007). Tapping a widget selects it, which opens its properties.
- **Without dragging (0001):** the properties panel has numeric position and size fields. There is no keyboard editing: an MFD is an input device next to the keyboard, not driven by it.

## Why

- Stretching keeps the builder and displays fully responsive with one simple model, and matches how people think about layouts ("this button is 5 × 3 cells").
- Orientation variants solve the one real failure of stretching (a landscape layout squeezed onto an upright phone) without introducing web-style breakpoints.
- MFDs don't stack instruments, so disallowing overlap keeps snapping predictable and the model simple.

## Consequences

- Breaking change to the document format: widget placement moved from `widget.area` to `page.layouts[].areas` (no documents exist yet, so no migration was needed).
- The schema validates that every widget has exactly one area per layout, that areas stay within the grid and that they don't overlap.
