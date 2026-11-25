# 0001: Responsive everywhere, including the builder

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

1. **Built MFDs work on any screen size.** A layout must render correctly on a phone, a tablet, a desktop monitor, a small square panel in a sim pit, or a Raspberry Pi touchscreen.
2. **The builder works on any screen size too.** Creating and editing an MFD, including drag-and-drop and resizing widgets, must be usable on touch devices and small screens, not only on a desktop with a mouse.

## Why

People will build on whatever device is nearest: often the same tablet or phone that will become the MFD. A builder that only works on a desktop would force a round trip between devices for every tweak.

## Consequences

- Layouts are stored in **relative units** (grid cells, fractions, aspect ratio), never absolute pixels.
- Drag, drop and resize use **Pointer Events** (one code path for mouse, touch and pen). The native HTML5 Drag and Drop API is out because it doesn't work on touch.
- Handles and hit targets must be touch-sized, and resizing can't depend on hover.
- Every drag or resize needs a **non-drag alternative** (keyboard, or numeric inputs in a properties panel) for accessibility and for precise placement on small screens.
- Editing on a small screen will probably need a different interaction mode from desktop, for example "select, then adjust" rather than freeform dragging. Design the builder interaction model with small screens first, then scale up.

## Resolved questions

- **One layout that adapts, or several per target?** One stretching grid per page, with optional orientation variants later. See 0006.
- **Previewing other screen sizes while editing:** the builder has a preview switcher. See 0006 and 0008.
