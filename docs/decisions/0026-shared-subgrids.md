# 0026: Shared subgrids

- **Status:** Accepted
- **Date:** 2026-11-27

## Context

With no chrome on the MFD beyond the header (0009), whatever a player needs on every page, such as page buttons, a status line, the connection, or the time in the game or on the wall, has to be part of the profile. Placing the same widgets on every page by hand is tedious, and they'd drift apart.

## Decision

- A profile can have **any number of shared subgrids**. A shared subgrid is placed once and shows on **every page, in the same place**. A page can't hide one.
- A shared subgrid has **its own columns and rows** and holds **any widget**. Widgets inside it work as they do on a page; they needn't know they're in one. Shared subgrids **don't nest**: one can't hold another.
- **Its place follows the page it's placed on:** it snaps to the cells of the page where it's placed or moved, and is kept as a share of the profile's shape, which every page has (0006). On a page with a different grid it covers every cell it touches, even partly.
- **A page's widgets under it are overlap** (0006), shown in red, and so are other shared subgrids. Adding or moving a shared subgrid shows where room has to be made, and the page tabs mark the pages that have such overlap.
- **A shared subgrid is added from the widget library**, like any widget, and starts empty, asking nothing. Its grid starts with **one cell per page cell it covers**, so it lines up with the page it's placed on; its columns and rows are changed in its properties. Resizing it keeps them, and its cells stretch, as a page's do when the profile's shape changes (0006).
- **A widget belongs to one grid**, a page or a shared subgrid, and stays in it: where it sits never changes which. A page's widget under a subgrid is still the page's, and overlap. Copy and paste (0006) puts a copy of a widget in another grid, a subgrid or another page; there's no move.
- **Switching pages is a widget like any other**, the page button (0018), placed by the profile's author, usually in a shared subgrid. The MFD adds no tabs of its own. The editor **warns about pages that can't be reached** on the MFD; they stay reachable through the editor (0009).

### Entering and leaving a shared subgrid

- **Outside it**, a shared subgrid is one widget on the canvas. Its contents are visible but can't be touched, under a **neutral hatching** (like the overlap's, but not red, so it doesn't read as overlap). It has no label, which could cover its neighbours. Pressing anywhere on it selects it, to move or resize it, and the properties panel shows its columns × rows and **Edit subgrid**. **Double-tapping it enters it** (on trial, 2026-11-28).
- **Edit subgrid enters it:** the hatching inverts, covering the canvas with the subgrid cut out. Its widgets can be selected, moved, resized and added, as on a page, and the library adds to it.
- **The properties panel follows one level down**, in the same panel rather than a stacked task, so the canvas stays usable (a stacked task is modal, 0008). With nothing selected it shows the subgrid's properties, with **Exit subgrid**. With a widget selected it shows that widget's properties, as on a page. A widget's own side tasks stack on it as usual.
- **Leaving it:** a single press on the cover outside the subgrid only lets go of the selection, as tapping empty cells does (0006). **Double-tapping the cover leaves the subgrid** (on trial, 2026-11-28; a single press with nothing selected used to). So do Exit subgrid and Escape.
- **Switching pages stays inside**, so a subgrid can be checked against each page's widgets.

## Why

- A grid that holds any widget does more than a page-switching widget would: players make their own status lines from what matters to them.
- Its own grid keeps it independent of the pages' grids, which may all differ (0006).
- Following the page it's placed on keeps every page's grid free; a grid for the whole profile would force every page's grid to divide into it. The cost is thin gaps beside it on pages with another grid.
- A warning rather than a built-in tab strip leaves the whole screen to the author, as on a real MFD, without stranding anyone.
- Entering a subgrid keeps two widgets on the same cells, one shared and one only on that page, from being confused: outside it, a press can only mean the subgrid; inside, only its widgets. Dragging a widget between grids was rejected for that reason.

## Consequences

- The document format gains shared subgrids at the profile level, each with a grid, a place as a share of the shape, and its widgets with their areas.
- The MFD's built-in tab strip goes, so starter profiles with more than one page need page buttons (0020).
- The MFD stacks shared subgrids above a page's widgets, so they take the touches where they overlap (0006). Shared subgrids that overlap each other stack like widgets: later ones on top, and moving one brings it to the front.
- "Shared subgrid" is in the glossary (0025).
- **Shared subgrids are in the first public beta** (0020), as the way to switch pages.
- The canvas needs a neutral hatching beside `canvas.overlap`, and the editor holds which subgrid is entered apart from the page shown.
