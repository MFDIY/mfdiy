# 0008: Builder interface layout

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

The canvas fills the whole screen only on the **display**. In the **builder**, the canvas is one part of the interface and is fitted into the space the builder's controls leave. Because layouts stretch (0006), editing on a canvas of a different size or shape is fine; the **preview switcher** shows the real shape when needed.

### Wide screens (desktop, tablet landscape)

- **Top toolbar** (slim): profile name, page tabs, Save and Save as new (0019), undo / redo, remove, preview shape, zoom, preview toggle.
- **Properties panel** on the right for the selected widget: bindings, options, action, theme overrides, position and size.
- **Canvas** fills the rest, centred and fitted to the preview shape.
- **Widget library** on the left, **always visible**: widgets and data to add, searchable. Tapping or clicking an empty cell marks the spot, and picking from the library adds the widget there (see "Add" in 0006).

### Narrow screens (phones)

- The canvas takes almost the whole screen, under a thin toolbar.
- Selecting a widget opens a **bottom sheet** with its properties. Half-open it shows the essentials and keeps the selected widget visible above it, zooming to it if needed; dragged up it shows the full panel.
- Tapping an empty cell opens the **widget library in a bottom sheet**, half-open so the marked cell stays visible above it, and draggable to full height. One sheet at a time: selecting a widget swaps it for the properties sheet.
- Opened **by touch**, its search field isn't focused, so no on-screen keyboard covers the list until it's tapped.

### Which form the library takes

**Pointer type, not only width, decides.** With a mouse or pen (`any-pointer: fine`) on a wide screen, the library is the sidebar, and widgets are dragged from it onto the canvas. With touch only, even on a large tablet, it's a sheet that opens when a cell is tapped: a finger moving over a list scrolls it, so dragging out of it would fight the scrolling. (Long-press to drag on touch could be added later.)

### In between

As the screen narrows, panels move into sheets one at a time, until on a phone everything but the canvas and a thin toolbar lives in sheets. Which panel moves first, and at what width, is decided when the layout is built, by container width, not device detection.

### Preview mode

A toggle hides all builder controls and shows the layout full-screen with live data, exactly as the display will render it.

## Why

- Keeps the canvas as large as possible on every device while giving properties a natural home: a panel where there is room, a sheet where there isn't.
- Bottom sheets are a familiar pattern on phones and keep the selected widget in view while it's edited.
- A library beside the canvas, or a half-open sheet under it, never covers the cell a widget is being added to, as a centred palette did. And the library and properties follow one pattern: a panel where there is room, a sheet where there isn't.

## Consequences

- The **canvas component fits any box** it's given; it doesn't assume it owns the viewport.
- **Properties are written once** and presented as either a side panel or a bottom sheet depending on available width (container queries, not device detection).
- The builder needs a bottom-sheet component in `packages/ui`, built on Base UI's Drawer (0003): non-modal so the canvas stays usable above it, with a half-open and a full-height stop, working with touch, mouse and keyboard, and respecting 0007 (no page scrolling; the sheet's own content may scroll, as it's builder UI, not MFD content).
- **The library and properties are each written once** and presented as a side panel or a sheet. The command palette is removed once the library replaces it; a keyboard shortcut focuses the library's search instead.
- The canvas, properties and library must not depend on the surrounding builder page, so they can be reused for in-place editing (0009).
- **Page tabs are a Tabs component**: navigation that grows with the pages and holds the "+" to add one, not a segmented control. A **segmented single-choice control** (e.g. a Light's colour when lit) is designed when the properties panel needs it; Bonsai's SegmentedControl was removed (0022).
