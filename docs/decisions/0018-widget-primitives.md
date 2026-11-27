# 0018: Widget primitives

- **Status:** Proposed
- **Date:** 2026-11-25

## Context

Primitives are the pure visual building blocks in `packages/instruments`; widgets connect them to signals and actions. The test for each one: does it show the game's data in a way that's clearly better than a plain number?

## Decision

### Version 1

- **Light:** annunciator. On an on/off signal it lights in `primary`; on a number signal it's off when normal, amber at its warning threshold and red at critical (0023). _Exists_; number signals still to do.
- **Lit button:** a Light that is also a button, showing its signal's state (gear, ESP, decoupled). _Exists_ as Light with an action.
- **Button:** one action, with **hold for _n_ ms** and **guard** as options, not separate primitives (0010). _Exists_; the options are still to do.
- **Page button:** switches the MFD page. A Button with a page-change action. The MFD has no page tabs of its own, so profiles with more than one page need these, usually in a shared subgrid (0026). _Exists_: a Button's action is a game action or Show page, and it's marked while its page is shown.
- **Readout:** a value as text, with a unit. _Exists._
- **Bar:** linear gauge, coloured by its binding's thresholds (0023). _Exists_; needs **vertical** and **segmented** options (counts like missiles or countermeasures).
- **Dial:** arc or round gauge (speed, G-force, temperature).
- **Label:** static text.

### Next

- **Facing gauge:** 2, 4 or 6 segments around a centre, each bound to its own signal (per-face shields).
- **Selector display** and **selector button:** all options of a multi-state signal with the active one highlighted (e.g. master mode); the button variant cycles or picks.
- **Sparkline:** recent history of a signal; needs a short history buffer in the telemetry store.
- **Icon:** static symbols from a built-in set.

### Later

- **Steadier numbers:** fast-changing values (speed in particular) are hard to read. Smoothing or throttling them must not lag the information; animating a change (the old value sliding out as the new one slides in) may help. Visual polish for the widget redesign.
- **Group:** a titled frame around several widgets: a nested grid that moves as a unit.
- **List-style widgets** with built-in paging (0007).
- **Slider, knob and XY pad:** analogue controls, reserved for the virtual input device channel (0011).

## Why

Covers what real MFD pages show and the data the game provides, in the order that delivers the most value soonest.

## Open questions

- Not yet confirmed by the maintainer, who was asked which primitives they'd use first in their own pit. Mark **Accepted** once confirmed or adjusted.
