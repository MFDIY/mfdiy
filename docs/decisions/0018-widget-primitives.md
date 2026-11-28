# 0018: Widget primitives

- **Status:** Proposed
- **Date:** 2026-11-25, revised 2026-11-28

## Context

Primitives are the pure visual building blocks in `packages/instruments`; widgets connect them to signals and actions. The test for each one: does it show the game's data in a way that's clearly better than a plain number?

## Decision

### Widget types differ in how they show a signal; any of them can be pressed

- **There is no Button widget.** A widget type is defined by how it represents its signal (a light, a number, a bar). Pressing is separate: **any widget without a touch interaction of its own can take an action**, a game action or showing a page. A Label with an action is a button; a Light with one is a lit push-button; a Readout or a Bar can have one too. Widgets with their own touch interaction (later: list paging, sliders, knobs, XY pads) can't.
- An action is never set by default; a widget only becomes pressable when its author gives it one. Hold and guard (0010) are options of the action, so every pressable widget gets them.
- Not how real MFDs work, where bezel keys are separate from the screen, but MFDIY runs on a touch screen.
- No migration from the Button widget: nothing is live yet, so saved profiles that use it simply show it as unknown.

### Pressable widgets show it

- On a touch screen nothing can be found by pointing at it, and pressing to find out does something in the game. So a pressable widget carries a **cue** drawn over it (`Pressable` in `packages/instruments`), a fixed look rather than a hover or pressed state (0022). Never hover or cursor changes: the MFD is used by touch.
- The cue also shows a widget **whose page is shown**, so a page button marks the current page in the same way whatever widget it is.
- **The press's answer:** the game acknowledges every action (`TriggerGameAction` returns a status, sent on as `action-result`), so a press is **waiting** until it answers, then **accepted** or **refused**. While waiting, a light runs around the widget's edge, shown only after a moment so the usual quick answer doesn't flash; with reduced motion it's a still ring. A widget whose action can't be used (not connected, not in the game's list, a deleted page) is dimmed.
- Being compared: corner marks, an inner frame, an edge along the bottom, or no cue (`Primitives/Pressable`, Compare Cues and Compare States). Tap feedback (0010, 0022) isn't built yet.

### Version 1

- **Light:** annunciator. On an on/off signal it lights in `primary`; on a number signal it's off when normal, amber at its warning threshold and red at critical (0023). _Exists_; number signals still to do. With an action, a lit push-button showing its signal's state (gear, ESP, decoupled).
- **Label:** static text. With an action, a button; with a page action, a **page button**, which switches the MFD page. The MFD has no page tabs of its own, so profiles with more than one page need page buttons, usually in a shared subgrid (0026). _Exists._
- **Readout:** a value as text, with a unit. Numbers are right-aligned, with optional leading zeros (0022). _Redesign in progress._
- **Bar:** linear gauge, coloured by its binding's thresholds (0023). _Exists_; its redesign covers **vertical**, **reversed**, **split** and **segmented** bars (counts like missiles or countermeasures).
- **Dial:** arc or round gauge (speed, G-force, temperature).

### Next

- **Facing gauge:** 2, 4 or 6 segments around a centre, each bound to its own signal (per-face shields).
- **Selector display:** all options of a multi-state signal with the active one highlighted (e.g. master mode); with an action, it cycles or picks.
- **Sparkline:** recent history of a signal; needs a short history buffer in the telemetry store.
- **Icon:** static symbols from a built-in set.

### Steadier numbers

Fast-changing values (speed in particular) are hard to read. Two problems, with different fixes:

- **Jitter:** a value that holds steady but whose last digit flickers. A **deadband** changes the number shown only once the value has moved a whole step (one unit of the last digit) from it, which never delays a real change.
- **Speed of change:** digits that change faster than they can be read. Being compared: showing a new number **at most four times a second**; **rolling digits**, each digit rolling into place like an aircraft's airspeed drum, so the fast digits blur while the slow ones stay readable; and **fewer digits while moving fast**, rounding to tens until the value settles.
- Never averaging or smoothing, which lags exactly when it matters and shows a number that isn't the current one. Thresholds are judged on the value itself, never on the number shown, so amber and red come on at once. Rolling respects reduced motion.
- `useSteadyNumber` and `steady.ts` in `packages/instruments`; compared side by side on the same live values in `Widgets/Steadying`, including the simulator's speed.

### Later

- **Group:** a titled frame around several widgets: a nested grid that moves as a unit.
- **List-style widgets** with built-in paging (0007).
- **Slider, knob and XY pad:** analogue controls, reserved for the virtual input device channel (0011).

## Why

Covers what real MFD pages show and the data the game provides, in the order that delivers the most value soonest. Separating how a widget shows its signal from whether it can be pressed means one set of types instead of a pressable twin for each.

## Open questions

- **Which cue**, and how loud: chosen from the comparison. Its colours are tokens (`press.*`), so a theme can make it louder or quieter.
- **Which way to steady numbers**, from the comparison, and whether it's built in or an option per widget.
- **Toggles:** a Light bound to the same thing its action toggles (gear) shows the state. A widget that doesn't show it (a Label that toggles the lights) could if the game adapter said which signal shows an action's state; then the cue could light like a page button's. Not decided.
- Mark **Accepted** once the maintainer has confirmed the list of types.
