# 0010: How actions work on the display

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

1. **One action per widget.** A widget triggers at most one action. There are no double-tap or press-and-hold variants on the display. A function that needs a different action gets its own labelled button, or goes on another page.
2. **Actions fire on touch** (`pointerdown`), not on release, with immediate visual feedback. In combat, a button must respond the instant it's touched. The feedback is a ripple from the touch point, inside the widget, and the game's answer on a rim around it (0018); there is no pressed state to hold (0022).
3. **Multi-touch:** each pointer is handled independently, so several buttons can be pressed at the same time.
4. **Game actions that need a hold are configured, not performed.** In the builder, a widget's action can be set to "hold for _n_ ms". A single touch then makes the bridge hold the action for that long (`holdMs` in the protocol), so the user never has to hold their finger down.
5. **Dangerous actions use a guarded button**, the cockpit idiom: the first touch lifts a cover, a second touch fires. The cover closes again by itself after a few seconds.
6. **Gestures on the display never edit the layout.** Entering edit mode (0009) always takes a deliberate, dedicated control.

## Why

- Overloading one control with press, hold and double-tap is a HOTAS habit born from having too few physical buttons, and it's exactly what forces players to memorise layouts. MFDs have screen space instead; dedicated, labelled buttons are the point of MFDIY.
- Firing on touch is what competitive players expect; firing on release feels laggy.
- Configured holds and guarded buttons keep every interaction to simple taps while still supporting hold-type and dangerous actions.

## Consequences

- Widget actions use `pointerdown`, not `click`. Activation by assistive technology (a `click` without a pointer) must still work.
- Pressing a button never gives it the focus. Otherwise a stray Space or Enter would fire the last pressed action again.
- Resting a finger on the screen fires actions; layouts should give dangerous actions a guard rather than rely on careful touches.
- The action configuration in a document needs a hold duration and a "guarded" flag.
- Changing pages is an action too, so page buttons (0018, 0026) also fire on `pointerdown`.

## Open questions

- **Haptic feedback on a tap.** The Vibration API (`navigator.vibrate`) works in Chrome on Android. Safari on iOS has no API for it; a known workaround (toggling a hidden `<input type="checkbox" switch>`) triggers the system haptic but is fragile. Haptics would be a per-device setting, not a theme token.
