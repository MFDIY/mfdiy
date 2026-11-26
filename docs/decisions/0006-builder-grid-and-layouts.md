# 0006: Builder grid, layouts and interaction

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

### A stretching grid of cells

- Each page layout is a grid of **columns × rows** that the user chooses. A new page starts at **24 × 16**, where one cell is about a fingertip on a landscape tablet; the grid can be changed at any time.
- The grid **stretches** to fill whatever screen it is shown on. Cells become rectangles on screens of a different shape; that's an accepted side effect of being fully responsive (0001). Widgets cope through container queries.
- Widgets snap to the grid: position and size are always whole cells. The builder shows the cell corners as a **dot grid**.
- When the grid size changes after widgets are placed, widget positions and sizes are **scaled proportionally**, then collisions caused by rounding are resolved where there is room, rather than clipping widgets at the new edge. Widgets that don't fit overlap.
- There is **no stored target screen size**. Instead the builder offers a **preview switcher** (phone portrait, tablet landscape, square panel, ...) that changes the canvas shape without changing the layout.

### Layouts per page, orientation variants later

- A page's widgets (type, options, bindings, action, theme overrides) are separate from their placement. Placement lives in the page's **layouts**: each layout has a grid and an area per widget.
- Version 1 has exactly one layout per page, matching any orientation.
- Later, a page can add a **portrait** and/or **landscape** variant. Orientation, not width breakpoints, is the breakpoint that matters for MFDs. Variants share the widgets, so a widget is configured once and only placed differently. The display picks the layout matching its orientation and falls back to the first layout, stretched.
- The document format supports multiple layouts from the start, so adding variants later needs no migration.

### Overlap is allowed, and highlighted

- Widgets must lie within the grid, but **may overlap**, always: there is no setting. The schema enforces the same for documents loaded from elsewhere.
- The builder **highlights the shared cells** in red, while dragging and afterwards, so widgets hidden behind others can be found.
- Pressing the selected widget again selects the next one **underneath** it. The selected widget is shown on top while it's being edited.
- **Stacking** follows the order of the page's widgets: later ones are on top. Moving a widget brings it to the front, so it doesn't vanish behind another once deselected.
- The display stacks widgets the same way, and the top one takes the touches.

### Own pointer code

Drag, drop and resize are built in-house on **Pointer Events** with `setPointerCapture`, not with a drag-and-drop library. Grid snapping and resizing are a small amount of code, and owning it keeps touch, pen and mouse behaviour fully under our control.

### Interaction

- **Move:** drag a widget; a snapped ghost previews the drop, with any overlap in red.
- **Resize:** corner and edge handles, at least 44 px on touch screens, never below the widget manifest's `minSize`.
- **Add:** tap an empty cell to mark the spot, then **pick a widget** in the **widget library** (a side panel, or a sheet on narrow screens; 0008), shown with a small preview, then **what it shows or does**, from only what suits it. A widget that shows data or does something is **always connected** when it's added. **Typing searches widgets and data at once**, so "hyd" and Enter adds a hydrogen fuel bar. Labels and units come from the signal.
- **Where it goes:** the default size, **centred on the pointer**. Beside other widgets and the page's edges it **slides** to keep that size, always covering the pointer. It shrinks only if nothing bigger fits, so adding doesn't cause overlap. (Should a widget ever start bigger, it **grows from there to the right** and down, and to the left and up only for what doesn't fit.) Only if not even its minimum size is free does a widget overlap.
- **A spot is always chosen, never guessed:** a widget is added where a cell was marked, or where it's dropped. There's no automatic placement.
  - **With a cell marked**, picking in the library adds the widget there.
  - **Without one**, the library's rows are dragged (the cursor shows `grab`): onto the canvas, where the dropzone follows the pointer as it does after marking a cell. A finished choice (a widget with what it shows or does) is added where it's dropped. A widget that still needs its data marks the spot where it's dropped, and the library moves on to its data, so the next pick adds it there; a widget is never added unconnected.
  - Browsing works without a mark: a widget's data can be opened and dragged out from there.
  - Clicking rows without a mark does nothing; after a few such clicks, a toast explains: "Tap a cell, or drag a widget onto the page."
  - Dragging needs a mouse or pen. With touch only, the library opens from tapping a cell (0008), so a spot is always marked.
- **Before adding:** hovering an empty cell with a mouse or pen outlines what any widget would **cover at least** there, with a **[+]** in the middle: quietly, as it follows the pointer around. It only appears when a click would add one, so not while a widget is selected. Fingers don't hover: after the tap, the same area marks the spot while a widget is picked, filled in. As every widget starts at the same size, it doesn't change while one is highlighted or picked.
- **Letting go:** with a widget selected, the first tap on an empty cell only deselects; the next one marks the spot to add.
- **Remove** the selected widget, and **undo / redo**, from the toolbar. Undo reaches past a save, and shows the page it changed.
- **Default sizes:** manifests give default sizes as a **share of the page**, rounded to whole cells when the widget is placed, so a new widget looks the same on any grid density. **Every widget starts at 1/6 of the page's width by 1/4 of its height** (4 × 4 cells on a new page), so every widget must work at that size.
- **Touch screens:** widgets can be dragged directly, since nothing scrolls (0007). Tapping a widget selects it, which opens its properties.
- **Without dragging (0001):** the properties panel has numeric position and size fields. There is no keyboard editing: an MFD is an input device next to the keyboard, not driven by it.

## Why

- Stretching keeps the builder and displays fully responsive with one simple model, and matches how people think about layouts ("this button is 5 × 3 cells").
- Orientation variants solve the one real failure of stretching (a landscape layout squeezed onto an upright phone) without introducing web-style breakpoints.
- Refusing overlap made a full page impossible to rearrange: there was never room to move a widget out of the way for a moment. Highlighting still catches accidents, and overlap makes layering (e.g. a label over a gauge) possible.

## Consequences

- Breaking change to the document format: widget placement moved from `widget.area` to `page.layouts[].areas` (no documents exist yet, so no migration was needed).
- The schema validates that every widget has exactly one area per layout and that areas stay within the grid.
