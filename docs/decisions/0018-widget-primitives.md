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

- On a touch screen nothing can be found by pointing at it, and pressing to find out does something in the game. So a pressable widget shows **corners** (`Pressable` in `packages/instruments`), a fixed look rather than a hover or pressed state (0022). Never hover or cursor changes: the MFD is used by touch.
- **Every widget has a corner box**, like a CSS box model: corner box, then border, then padding. A pressable widget draws its corners in it; one without an action keeps it empty (`CornerBox`), so the two line up and giving a widget an action moves nothing. Theme tokens: `corner.width`, the corners' thickness (2 px), `corner.gap`, air between corners and widget (3 px), and `press.cue`, their colour, falling back to `text.dim`. The gap between widgets stays the theme's `gap` (0022).
- Chosen by comparing, in Storybook: corners at 1, 2 and 3 px, flush or with air, in `line`, `text.dim`, `text`, `accent` and `secondary.8`. Ruled out: no cue; an edge along the bottom; corners or a frame that shrink only pressable widgets; corners against the border; a frame inside the widget, as a hairline or 2 px, which feels wrong among hairlines; and `accent`, which can't be told apart from an accepted press.
- **Actions are only input.** The game answers a press with whether it took it (`TriggerGameAction` returns a status, sent on as `action-result`), never with what changed; that comes back through the signals. So a pressable widget shows only the press, all within its corner box, with nothing solid beyond it (only glows):
  - **Tap:** a ripple from the touch point, clipped by the widget's border (0022). Every widget clips its content there, so nothing sticks out of it.
  - **Waiting** for the game: the corner box becomes a rim with two lights chasing around it, shown only after a moment so the usual quick answer doesn't flash.
  - **Accepted:** the rim turns solid in `press.accepted` and fades out.
  - **Refused:** the rim turns solid in `press.failed` and pulses three times in the time accepted takes to fade.
  - The answer shows for 1.2 s; then the rim fades out as the corners fade back in. The corners hide while any rim shows.
  - **Unavailable** (not connected, not in the game's list, a deleted page): the corners hide, as the action can't be used, while the widget's data stays as it is, since it's still true. Pressing it shows it refused, without sending it.
  - With reduced motion, the rim is still and nothing pulses.
  - Tried in `Primitives/Pressable` (Pressing, live, and States).
- **A widget shows the state its action changes by being bound to it**, like any data: a gear button is a Light bound to the gear signal, whose action toggles the gear.

### Page shown is a signal

- The one state that doesn't come from the game is which page the MFD shows. **The MFD provides it as signals**, one on/off signal per page, on while it's shown (`mfd.page.<id>`, in a "Pages" group, named after the page; `pageSignals` in `packages/schema`). Signals the MFD provides start with `mfd.`, which game adapters don't use; page ids are shaped like signal ids for it.
- A **page button that marks the shown page** is a Light bound to that page's signal, with "Show page" as its action. Giving a page action to a widget whose input asks for it (`pageShown`, the Light's) while it has no data binds the page's signal too, which can still be changed. A Label with a page action is a page button that doesn't mark it.
- No special treatment otherwise: the page button lights through the Light's own tokens.

### Version 1

- **Light:** annunciator. On an on/off signal it lights in `primary`; on a number signal it's off when normal, amber at its warning threshold and red at critical (0023). _Exists_; number signals still to do. With an action, a lit push-button showing its signal's state (gear, ESP, decoupled), or, bound to a page's signal, a page button lit while its page is shown.
- **Label:** static text. With an action, a button. A widget with a page action is a **page button**, which switches the MFD page. The MFD has no page tabs of its own, so profiles with more than one page need page buttons, usually in a shared subgrid (0026); the starter profile's are Lights, so the shown page is lit. _Exists._
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

- **The press states** as built: to be felt on a tablet; the pulses' speeds and counts may need tuning.
- **Which way to steady numbers**, from the comparison, and whether it's built in or an option per widget.
- Mark **Accepted** once the maintainer has confirmed the list of types.
