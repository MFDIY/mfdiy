# 0008: Builder interface layout

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

The canvas fills the whole screen only on the **display**. In the **builder**, the canvas is one part of the interface and is fitted into the space the builder's controls leave. Because layouts stretch (0006), editing on a canvas of a different size or shape is fine; the **preview switcher** shows the real shape when needed.

### Wide screens (desktop, tablet landscape)

- **Top toolbar** (slim): profile name, page tabs, Save and Save as new (0019), undo / redo, remove, preview shape, zoom, preview toggle.
- **Properties panel** on the right for the selected widget, or the page when nothing is selected (0023).
- **Canvas** fills the rest, centred and fitted to the preview shape.
- **Widget library** on the left, **always visible**: widget types to add, searchable. Tapping or clicking an empty cell marks the spot, and picking from the library adds the widget there (see "Add" in 0006).

### Narrow screens (phones)

- The canvas takes almost the whole screen, under a thin toolbar.
- The **properties sheet never fully closes**: closed, it **peeks** at the bottom with only its title (the selected widget's name, or "Page") in view, to drag or expand up again, like a map's sheet. The canvas stops above it. Selecting a widget opens it half-way; swiping it down or closing it lets it peek again without deselecting, and the page's properties are always within reach. Its content scrolls, so everything is reachable while it's half-open; half-open only keeps the selected widget visible above it. Dragged up, more fits at once.
- Tapping an empty cell opens the **widget library in a bottom sheet**, half-open so the marked cell stays visible above it, and draggable to full height. Unlike the properties sheet, it closes fully, as it's only needed after tapping a cell. One sheet at a time: selecting a widget swaps it for the properties sheet.
- Opened **by touch**, its search field isn't focused, so no on-screen keyboard covers the list until it's tapped.

### Which form the library takes

**Pointer type, not only width, decides.** With a mouse or pen (`any-pointer: fine`) on a wide screen, the library is the sidebar, and widgets are dragged from it onto the canvas. With touch only, even on a large tablet, it's a sheet that opens when a cell is tapped: a finger moving over a list scrolls it, so dragging out of it would fight the scrolling. (Long-press to drag on touch could be added later.)

### In between

Both panels switch between sidebar and sheet together, in one place (`PanelLayout` in `packages/ui`): they're sidebars with a mouse or pen and room for them, sheets otherwise, so on a phone everything but the canvas and a thin toolbar lives in sheets, one at a time. The properties sidebar stays in place when nothing is selected, so the canvas doesn't change size with the selection: it then shows the page's properties (0023). Sidebars have a fixed width; resizing or collapsing them can come later.

A side task inside a panel, like choosing a widget's data, replaces a sidebar's contents and offers Back. On a sheet, it opens as a **modal sheet stacked on top**, with a darkened backdrop, and closes instead of going back. `PanelTask` in `packages/ui` chooses between the two, so a panel's code doesn't depend on its form.

### Preview mode

A toggle hides all builder controls and shows the layout full-screen with live data, exactly as the display will render it.

## Why

- Keeps the canvas as large as possible on every device while giving properties a natural home: a panel where there is room, a sheet where there isn't.
- Bottom sheets are a familiar pattern on phones and keep the selected widget in view while it's edited.
- A library beside the canvas, or a half-open sheet under it, never covers the cell a widget is being added to, as a centred palette did. And the library and properties follow one pattern: a panel where there is room, a sheet where there isn't.

## Consequences

- The **canvas component fits any box** it's given; it doesn't assume it owns the viewport.
- **Properties are written once** and presented as either a side panel or a bottom sheet depending on available width (container queries, not device detection).
- The builder needs a bottom-sheet component in `packages/ui`, built on Base UI's Drawer (0003): non-modal so the canvas stays usable above it (modal, with a backdrop, for a side task stacked on it), with a half-open and a full-height stop, and a peeking stop for the properties sheet, working with touch, mouse and keyboard, and respecting 0007 (no page scrolling; the sheet's own content may scroll, as it's builder UI, not MFD content).
- **The library and properties are each written once** and presented as a side panel or a sheet. The command palette is removed once the library replaces it; a keyboard shortcut focuses the library's search instead.
- The canvas, properties and library must not depend on the surrounding builder page, so they can be reused for in-place editing (0009).
- **Page tabs are a Tabs component**: navigation that grows with the pages and holds the "+" to add one, not a segmented control. A **segmented single-choice control** (e.g. a Light's colour when lit) is `SegmentedControl`: a few options in a fixed frame, the chosen one tinted (0022); it replaced Bonsai's.
