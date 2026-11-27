# 0006: Builder grid, layouts and interaction

- **Status:** Accepted
- **Date:** 2026-11-24 (shape added and orientation variants dropped 2026-11-27)

## Decision

### A profile has a shape

- A profile has a **shape**: the ratio of the screen it's made for, typed as `16:10`, `1920:1080` or `1920 × 1080` (only the ratio counts), picked from common screens (16:10, 4:3, 16:9, a phone at 9:19.5), or taken with **Use this screen** from the device the builder is open on, such as the tablet that will show it. New profiles default to **16:10**: Android tablets' ratio, and closer to an iPad's 4.3:3 than 16:9 is.
- The builder **always shows pages in the profile's shape**, on any device, so a profile looks the same on a phone and a laptop, only zoomed differently (0024).
- A **display** keeps the shape by default: the page as large as fits, centred, with bars in the theme's background. A profile can instead **stretch** to fill any screen, for use anywhere; cells then become rectangles on screens of another shape, and widgets cope through container queries.
- **Creating a profile asks only for its shape**, in a dialog, and opens its canvas; its name ("New profile") and everything else are set there. Save as new and duplicating keep the shape.
- On the canvas, a **label above the page's top-left corner**, like an artboard's name, shows the profile and page and the shape and grid: "Fighter · Flight", then "16:10 · 24 × 15". Pressing it shows the **profile's settings** in the properties panel (0023): its name, its shape, and Keep shape or Stretch for other screens.
- Profiles saved before shapes existed get 16:10 and keep their grids; there's no migration, as nothing has been released yet.

### A grid per page

- Each page layout is a grid of **columns × rows** that the user chooses. A new page's grid is **seeded with square-ish cells** for the profile's shape as it is at that moment: 24 cells along the longer side, and as many along the shorter as keeps them closest to square (16:10 → 24 × 15, 4:3 → 24 × 18, a phone → 11 × 24). One cell is then about a fingertip on a tablet. The grid can be changed at any time, so cells may be as stretched as the user likes.
- **Changing the shape leaves every page's grid as it is**: the cells take the new shape. Pages added afterwards are seeded for the new shape.
- Widgets snap to the grid: position and size are always whole cells. The builder shows the cell corners as a **dot grid**.
- When the grid size changes after widgets are placed, widget positions and sizes are **scaled proportionally**, then collisions caused by rounding are resolved where there is room, rather than clipping widgets at the new edge. Widgets that don't fit overlap.
- A **preview switcher** (phone portrait, tablet landscape, ...) for stretching profiles stays postponed (0020): with a stored shape, the builder already shows what matters.

### One layout per page, no orientation variants

- A page's widgets (type, options, bindings, action, theme overrides) are separate from their placement. Placement lives in the page's **layout**: a grid and an area per widget.
- A page has **exactly one layout**, for any orientation. There are no portrait or landscape variants: a profile is made for one screen's shape, and stretching covers other screens. Nobody turns a mounted MFD mid-flight.
- What shows on every page, such as page buttons or a status line, goes in a **shared subgrid** (0026), placed once for the whole profile.

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
- **Add:** tap an empty cell to mark the spot, then **pick a widget** in the **widget library** (a side panel, or a sheet on narrow screens; 0008), shown with a small preview and found by search. A widget is added as a **type, without data**: what it shows or does is chosen in its properties (0023), because a widget may take several signals. Labels and units come from the signal once it's chosen.
- **Where it goes:** the default size, **centred on the pointer**. Beside other widgets and the page's edges it **slides** to keep that size, always covering the pointer. It shrinks only if nothing bigger fits, so adding doesn't cause overlap. (Should a widget ever start bigger, it **grows from there to the right** and down, and to the left and up only for what doesn't fit.) Only if not even its minimum size is free does a widget overlap.
- **A spot is always chosen, never guessed:** a widget is added where a cell was marked, or where it's dropped. There's no automatic placement.
  - **With a cell marked**, picking in the library adds the widget there.
  - **Without one**, the library's rows are dragged (the cursor shows `grab`): onto the canvas, where the dropzone follows the pointer as it does after marking a cell. The widget is added where it's dropped.
  - Clicking rows without a mark does nothing; after a few such clicks, a toast explains: "Tap a cell, or drag a widget onto the page."
  - Dragging needs a mouse or pen. With touch only, the library opens from tapping a cell (0008), so a spot is always marked.
- **Before adding:** hovering an empty cell with a mouse or pen outlines what any widget would **cover at least** there, with a **[+]** in the middle: quietly, as it follows the pointer around. It only appears when a click would add one, so not while a widget is selected. Fingers don't hover: after the tap, the same area marks the spot while a widget is picked, filled in. As every widget starts at the same size, it doesn't change while one is highlighted or picked.
- **Letting go:** with a widget selected, the first tap on an empty cell only deselects; the next one marks the spot to add. Both happen on release, not on press, so a drag on empty cells pans instead (0024).
- **Duplicate** and **remove** the selected widget from the properties panel's header (0023); **undo / redo** from the toolbar. Undo reaches past a save, and shows the page it changed.
- **Copy and paste** are editor buttons, so they work on a tablet without a keyboard. **Copy** takes the selected widget; **Paste** adds a copy of it to the grid being edited: another page, or a shared subgrid that's entered (0026). It's how a widget gets from one grid to another; widgets aren't moved between grids. Ctrl+C and Ctrl+V (⌘C and ⌘V on a Mac) are shortcuts for the buttons.
- **Default sizes:** manifests give default sizes as a **share of the page**, rounded to whole cells when the widget is placed, so a new widget looks the same on any grid density. **Every widget starts at 1/6 of the page's width by 1/4 of its height** (4 × 4 cells on a new 16:10 page), so every widget must work at that size.
- **Touch screens:** widgets can be dragged directly, since nothing scrolls (0007). Tapping a widget selects it, which opens its properties.
- **Without dragging (0001):** the properties panel has numeric position and size fields. Nothing needs a keyboard; its only shortcuts stand in for buttons (copy and paste, and zoom, 0024). An MFD is an input device next to the keyboard, not driven by it.

## Why

- A grid of cells matches how people think about layouts ("this button is 5 × 3 cells").
- A stored shape came from seeing the same profile on a phone and a laptop: with the canvas taking the shape of whatever space the builder had, they looked like different pages. Keeping the shape makes a profile look as designed; stretching stays available for "use it anywhere". Seeding square-ish cells gives widgets natural proportions without forcing them, as some layouts want stretched cells.
- Orientation variants were planned for a landscape layout squeezed onto an upright phone. With a stored shape, a profile is made for the screen it will be shown on, so variants would add work to every page for a case that hardly happens.
- Refusing overlap made a full page impossible to rearrange: there was never room to move a widget out of the way for a moment. Highlighting still catches accidents, and overlap makes layering (e.g. a label over a gauge) possible.

## Consequences

- Breaking change to the document format: widget placement moved from `widget.area` to `page.layouts[].areas` (no documents exist yet, so no migration was needed).
- The schema validates that every widget has exactly one area per layout and that areas stay within the grid.
- The document format still holds a list of layouts, each with an orientation, from when variants were planned. It can become a single layout per page.

## Open questions

- **Where a pasted widget goes:** the marked cell if there is one, otherwise the place it was copied from (as a share of the page, like default sizes), sliding to fit as when adding.
- **Where the Copy and Paste buttons sit:** perhaps Copy beside Duplicate in the properties panel's header, as it acts on the selected widget, and Paste in the header's `⋯` menu with its keys shown, like zoom (0024), as it acts on the grid being edited.
