# 0024: Panning and zooming the canvas

- **Status:** Accepted (first pass; limits and speeds to be tuned by feel)
- **Date:** 2026-11-27

## Context

On a phone, the half-open properties sheet (0008) can cover the widget being edited. Map apps solve the same problem by moving the map so the selected place sits above the sheet. A canvas that pans and zooms also makes small widgets on dense pages easier to grab. 0020 first listed zoom as after the beta; it moves into the beta, as editing on a phone needs it. It comes before the widget redesign, since it changes the space every widget is shown in.

## Decision

### The page stays attached to the fingers

- **Two fingers pan and zoom.** The zoom is the distance between the fingers now divided by the distance when they touched down, and the point of the page under the midpoint of the fingers stays under that midpoint. Everything is measured from the start of the gesture, never added up frame by frame, so it can't drift away from the fingers or feel too fast or too slow. There is no rotation: twisting the fingers does nothing, and the page slides a little under them while the midpoint stays put.
- Lifting one finger keeps the gesture going with the other, as a pan; putting a second one down pinches again.
- A second finger landing before the first has started moving a widget turns the press into a pinch. Once a widget is being dragged, a second finger does nothing.
- **One finger** keeps doing what it did: select, move and resize widgets, and tap empty cells (0006). Dragging it across the page's empty cells shows a toast: "Use two fingers to move or zoom the page." Around the page, where there's nothing to press, one finger pans.
- No double-tap to zoom: it would make every tap on a cell wait for a possible second tap.

### With a mouse or pen

- **Dragging pans**: around the page, or on its empty cells. A press that doesn't move is still a click, so marking a cell and letting go of a selection work as before. Letting go of a selection now happens on the click rather than the press, so the page can be dragged without losing it. The cursor is a hand. The middle button pans from anywhere, widgets included.
- This rules out dragging a box around several widgets to select them. Multi-select isn't planned; if it comes, it needs another gesture.
- **Scrolling pans** (Shift scrolls sideways), and **Ctrl or ⌘ + scroll zooms** at the pointer. A trackpad pinch reaches the browser as Ctrl + scroll, so it zooms the same way. Browsers can't tell a mouse wheel from a trackpad, so one rule serves both. One wheel notch zooms about 1.28×; a trackpad pinch follows the fingers. Safari's own trackpad pinch is handled too.
- **`+`, `−` and `0`** zoom in, zoom out and fit, unless a field has focus. The same three are in the header's menu (☰, 0008), with their keys shown, so they can be found.

### Limits

- **Fit** is everything that matters in view: the page in the profile's shape (0006) and its label above it, with a margin (16 px) around them, centred. The editor opens at fit, and stays fitted as the screen changes size until the view is moved.
- Zooming out stops at **half of fit**, so there's room around the page; going past a limit during a gesture stretches with resistance and springs back on release.
- Zoom in stops at 6× fit, with the same give. The page's position is rounded to whole pixels, so it stays crisp.
- Panning stops when the page covers less than a quarter of the viewport along either axis (or all of it, if the page is smaller), so there is always some canvas in view. Past that, it stretches and springs back.
- The page is resized rather than scaled, so the MFD stays sharp and resize handles, outlines and the [+] stay their size on screen.

### Clicking white space lets go

A click or tap that doesn't move, anywhere off the grid (around the page, or in its padding), lets go of whatever is active: the selected widget, the profile's settings, or a marked cell, closing its sheet on a phone. It's what clicking white space does everywhere else, so not doing it feels broken. A drag there still pans. Empty cells keep their own rule (0006): the first tap lets go, the next marks a spot.

### Momentum

Letting go while moving glides on and slows down, like a scroll view (iOS's deceleration), with fingers, a mouse drag and the trackpad (which brings its own). With reduced motion there's no glide, and moves made for the user are instant.

### Keeping the selection in view above a sheet

When a sheet covers part of the canvas (on phones and touch tablets, 0008), selecting a widget or marking a cell to add one brings it into view above the half-open sheet, **only if it isn't already fully visible there**. It's then centred in the space above the sheet, and zoomed out only if it doesn't fit, even past fit; never zoomed in. A gesture then can't zoom out further than that. With sidebars, nothing moves by itself.

### Only in the builder

The display never pans or zooms (0007): it always shows the whole page.

## Open questions

- The numbers are a first pass, to be tuned by feel: the 16 px margin, half of fit and 6× as limits, the quarter-viewport limit, wheel speed, and how long a fling glides.
- Whether a mouse user without a trackpad finds Ctrl + scroll; if not, the zoom controls could leave ☰.

## Why

- Anchoring the page to the fingers from the start of the gesture is what makes a pinch feel attached, as in a maps app; adding up deltas is what makes some pinches feel too sensitive.
- Two fingers for the view keeps one finger for widgets, so the two never compete.
- Moving the view only when the selection is hidden keeps the canvas where the user left it.

## Consequences

- The canvas fills its box edge to edge and fits the page inside with a margin. The builder page no longer pads around it, and sidebars pad themselves (`PanelLayout`).
- `PanelLayout` says how much of the screen an open sheet covers (`useSheetCover`), so the canvas can keep things in view above it.
- `MenuItem` can show a keyboard shortcut.
