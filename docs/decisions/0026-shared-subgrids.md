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
- **Switching pages is a widget like any other**, the page button (0018), placed by the profile's author, usually in a shared subgrid. The MFD adds no tabs of its own. The editor **warns about pages that can't be reached** on the MFD; they stay reachable through the editor (0009).

## Why

- A grid that holds any widget does more than a page-switching widget would: players make their own status lines from what matters to them.
- Its own grid keeps it independent of the pages' grids, which may all differ (0006).
- Following the page it's placed on keeps every page's grid free; a grid for the whole profile would force every page's grid to divide into it. The cost is thin gaps beside it on pages with another grid.
- A warning rather than a built-in tab strip leaves the whole screen to the author, as on a real MFD, without stranding anyone.

## Consequences

- The document format gains shared subgrids at the profile level, each with a grid, a place as a share of the shape, and its widgets with their areas.
- The MFD's built-in tab strip goes, so starter profiles with more than one page need page buttons (0020).
- The MFD stacks shared subgrids above a page's widgets, so they take the touches where they overlap (0006). Shared subgrids that overlap each other stack like widgets: later ones on top, and moving one brings it to the front.
- "Shared subgrid" is in the glossary (0025).
- **Shared subgrids are in the first public beta** (0020), as the way to switch pages.

## Open questions

- **How widgets are placed inside a shared subgrid** in the editor.
