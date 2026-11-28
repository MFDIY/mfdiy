# 0008: Builder interface layout

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

The canvas fills the whole screen only on the **display**. In the **builder**, the canvas is one part of the interface and is fitted into the space the builder's controls leave. Because layouts stretch (0006), editing on a canvas of a different size or shape is fine; the **preview switcher** shows the real shape when needed.

### Wide screens (desktop, tablet landscape)

- **Header** (one row exactly a control high, edge to edge, with padding only after the exit on a desktop, over a hairline across the whole screen): the **MFDIY logomark** in the accent of the page shown (0022), padded as part of the mark, a full-height divider, the page tabs, then undo, redo, **Save**, a **menu (☰)** and an **exit (×)** back to the profile, side by side with no gaps. The exit at the far right and the ☰ icon are on trial (2026-11-28); they replaced a Back chevron before the tabs and a `⋯` icon. The profile's name isn't shown; the library shows it. ☰ holds every other profile action: Copy and Paste, with their keys (0006), Zoom in, Zoom out and Zoom to fit, with their keys (0024), and Save as new (0019); preview shape and the preview toggle join it or the row when they're built. Removing a widget is in its properties (0023).
- **Properties panel** on the right for the selected widget, or the page when nothing is selected (0023).
- **Canvas** fills the rest, edge to edge, with the page in the profile's shape and its label (0006) fitted inside it, and pans and zooms (0024).
- **Widget library** on the left, **always visible**: widget types to add, searchable. Tapping or clicking an empty cell marks the spot, and picking from the library adds the widget there (see "Add" in 0006).

### Narrow screens (phones)

- The canvas takes almost the whole screen, under the same header in one row. The logomark gives way first; on a phone, **undo and redo move into ☰** (after the other actions), so the tabs have the row. Save stays beside ☰, so pending changes always show. Tabs that don't fit go behind one icon button (`list_arrow`) whose tooltip says how many, rather than a "+N" label, so the row fits a 320 px screen. The header always spans the page, so it and its menu answer to the page's width together.
- **Save shows the save status itself**, on every screen: the accent (primary) while there are changes to save, a greyed-out quiet button when there are none. No status text sits beside it, as one changing length shifted the buttons around it. A failed save says why in a toast that stays until dismissed; a profile changed on another device is explained when Save is pressed.
- The **properties sheet never fully closes**: closed, it **peeks** at the bottom: a control's height (44 px on touch, above what the phone keeps clear at the bottom) with its handle and its title (the selected widget's name, or "Page") in label text. Pressing anywhere on it opens it, or it's dragged up, like a map's sheet. A 44 px peek keeps the grab area out of the system's swipe-up zone at the bottom of the screen. The canvas stops above it. Selecting a widget opens it half-way; swiping it down (or Escape) lets it peek again without deselecting, and the page's properties are always within reach. Its content scrolls, so everything is reachable while it's half-open; half-open only keeps the selected widget visible above it. Dragged up, more fits at once.
- Tapping an empty cell opens the **widget library in a bottom sheet**, half-open so the marked cell stays visible above it, and draggable to full height. Unlike the properties sheet, it closes fully, as it's only needed after tapping a cell. One sheet at a time: selecting a widget swaps it for the properties sheet.
- Opened **by touch**, its search field isn't focused, so no on-screen keyboard covers the list until it's tapped.

### Which form the library takes

**Pointer type, not only width, decides.** With a mouse or pen (`any-pointer: fine`) on a wide screen, the library is the sidebar, and widgets are dragged from it onto the canvas. With touch only, even on a large tablet, it's a sheet that opens when a cell is tapped: a finger moving over a list scrolls it, so dragging out of it would fight the scrolling. (Long-press to drag on touch could be added later.)

### In between

Both panels switch between sidebar and sheet together, in one place (`PanelLayout` in `packages/ui`): they're sidebars with a mouse or pen and room for them, sheets otherwise, so on a phone everything but the canvas and a thin toolbar lives in sheets, one at a time. The properties sidebar stays in place when nothing is selected, so the canvas doesn't change size with the selection: it then shows the page's properties (0023). Sidebars have a fixed width; resizing or collapsing them can come later.

A side task inside a panel, like choosing a widget's data, replaces a sidebar's contents. On a sheet, it opens as a **modal sheet stacked on top**, at the height the sheet under it rests at. Either way it offers Back, and closes by choosing something in it, Back, or, as a sheet, swiping it down. Stacked on a fully open sheet, it opens fully too: the depth only means something while sheets are half open. The sheets under it **follow it**: they rise just above it, wherever it is and while it's dragged, so coming down from full shows the stack, and they can't be used until it closes. **Dragged or flicked closed**, it leaves the sheet under it half open, rather than taking it down too. **One backdrop** darkens the page under the whole stack, never one per sheet. `PanelTask` in `packages/ui` chooses between the two, so a panel's code doesn't depend on its form.

### Sheets and sidebars pad and scroll their content

What's in a panel touches its edges; the sidebar or sheet around it pads it and scrolls it, with the padding inside the scroll area, so the scrollbar sits at the edge of the screen or sidebar. Nothing inside scrolls on its own: a panel's heading scrolls away with its content, and a search field stays in view by sticking. On a phone, a finger on the content scrolls it, and pulls the sheet down once the content is at its top, like a map's sheet. Pushing up on the content only scrolls it: a half-open sheet doesn't grow from its content, unlike Maps or iOS, so the canvas stays in view while a widget is edited and changes show on it straight away. Opening the sheet fully is a deliberate choice, made by dragging its header (handle and title).

### Sheets have no buttons of their own

A sheet is only a header and its content: no expand or close buttons. The header is its handle with its title under it in label text, a control's height, the same whether the sheet peeks or is open, so nothing shifts when it's let go; the content doesn't repeat the title. Flicking and dragging move it between its stops, Escape closes it, and its content closes it where that makes sense (choosing something, Back). Its title still names it for assistive technology. Every row the header took is given to the content, which matters most on a phone.

On Android, the system Back gesture closes the top sheet or dialog instead of leaving the page (Base UI answers the browser's close requests, as it does Escape). Keep it: it's the most natural way to put a stacked sheet away. Browsers without close requests (Safari, as far as known) may go back a page instead; check before relying on it there.

Within a panel, Back sits in the search field it belongs to, as one control (`‹ | Search… | ×`), named after where it goes ("Back to Fuel").

### Leaving the editor

The editor opens from a profile's Edit button, on the page being shown, and the **exit (×)** at the far right of the header, named after where it goes ("Back to Fighter"), leaves it for the profile again, on the page being edited (0009). That replaces a preview mode: the profile itself shows the MFD with live data, exactly as it renders.

## Why

- Keeps the canvas as large as possible on every device while giving properties a natural home: a panel where there is room, a sheet where there isn't.
- Bottom sheets are a familiar pattern on phones and keep the selected widget in view while it's edited.
- A library beside the canvas, or a half-open sheet under it, never covers the cell a widget is being added to, as a centred palette did. And the library and properties follow one pattern: a panel where there is room, a sheet where there isn't.

## Consequences

- The **canvas component fits any box** it's given; it doesn't assume it owns the viewport.
- **Properties are written once** and presented as either a side panel or a bottom sheet depending on available width (container queries, not device detection).
- The builder needs a bottom-sheet component in `packages/ui`, built on Base UI's Drawer (0003): non-modal so the canvas stays usable above it (modal, with a backdrop, for a side task stacked on it), with a half-open and a full-height stop, and a peeking stop for the properties sheet, working with touch, mouse and keyboard, and respecting 0007 (no page scrolling; the sheet's own content may scroll, as it's builder UI, not MFD content).
- **The library and properties are each written once** and presented as a side panel or a sheet. The command palette is removed once the library replaces it; a keyboard shortcut focuses the library's search instead.
- The canvas, properties and library must not depend on the surrounding builder page, so they can be developed and tested in Storybook (0021).
- **Page tabs are a Tabs component**: navigation that grows with the pages and holds the "+" to add one, not a segmented control. Tabs have no menu of their own: renaming, duplicating and deleting a page are in the page's properties (0023), next to its grid. "+" adds an empty page at the end, named "Page _n_" with a new page's grid (0006), and shows it.
- **Save is a plain button**, with everything else in ☰. A split button (`[Save|▾]`, perhaps with more parts) was considered and postponed: when it comes, it's a group of quiet Buttons and IconButtons in one frame whose border and dividers react to hover, focus and press together, rather than a component of its own. A **segmented single-choice control** (e.g. a Light's colour when lit) is `SegmentedControl`: a few options in a fixed frame, the chosen one tinted (0022); it replaced Bonsai's.
