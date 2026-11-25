# 0007: No scrolling, paging instead

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

1. **The display never scrolls.** An MFD page always fills the screen exactly. When a layout gets crowded, users add a page or use a finer grid; pages replace scrolling, as on real MFDs.
2. **The builder canvas never scrolls.** It has the shape of a page and is fitted into whatever space it is given (see 0008). The only exception is **zoom while editing**, an editing aid that doesn't change the layout.
3. **Widgets with more content than fits** (e.g. a future list of missions or contacts) page through it inside the widget with previous / next controls, not by scrolling.
4. Because nothing scrolls, the display and the canvas claim all touch gestures (`touch-action: none`) and disable overscroll (`overscroll-behavior: none`), so drags never compete with page scrolling, pull-to-refresh or browser back-swipes. In the builder, widgets can therefore be dragged directly on touch screens (0006).

## Why

- Real MFDs show one fixed screen per page and split long content into numbered pages; MFDIY follows the same mental model.
- A display that always fits the screen is essential for sim pits, where the screen is mounted and nobody wants to scroll mid-flight.
- Owning all touch gestures makes drag and resize reliable on phones and tablets.

## Consequences

- Layout density is limited by the grid and the page count, never by page length.
- The builder needs zoom (pinch, and a zoom control for mouse and keyboard users) for precise editing on small screens.
- List-like widgets need built-in paging from the start.
