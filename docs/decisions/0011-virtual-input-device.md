# 0011: Virtual input device as a second action channel

- **Status:** Proposed
- **Date:** 2026-11-24

## Context

The game's telemetry API only triggers a fixed allowlist of discrete actions (and excludes weapons). The game itself also accepts analogue input through joystick axes and any action through its keybinds, but not through the API.

## Decision

Later, the bridge can optionally present a **virtual input device** (a virtual joystick) on the gaming PC. MFD controls can then send input through it, as a second channel next to API actions:

| Channel                       | Used for                                                                           | Feedback               | Setup                            |
| ----------------------------- | ---------------------------------------------------------------------------------- | ---------------------- | -------------------------------- |
| **API actions** (primary)     | Allowlisted discrete actions                                                       | pending / ok / failed  | None                             |
| **Virtual device** (optional) | Analogue axes; any keybind, including taps, holds and double-taps the game expects | None (fire and forget) | Driver install, keybinds in game |

This enables **analogue primitives**: **slider** (e.g. throttle limiter, mining laser power, scanner angle), **knob**, and **XY pad** (e.g. the power triangle).

Rules:

- 0010 still applies: an MFD control does exactly one thing for the user. The virtual device only changes what is delivered to the game (e.g. a tap on the MFD can produce a double-tap on a virtual button).
- API actions stay the default wherever an action exists in both channels, because they give feedback and need no setup.
- The builder shows clearly which channel a control uses, and that virtual-device controls can't confirm success.

## Why

- Analogue controls (sliders, knobs, the power triangle) are among the most natural things to put on a touchscreen, and the API can't drive them.
- It covers every keybind, so players aren't limited to what the API exposes.
- The maintainer has done this before (MIDI controllers mapped to vJoy), so the approach is proven for this setup.

## Consequences

- **Driver dependency.** vJoy is the usual choice; the original is unmaintained and community forks support Windows 10 and 11. ViGEmBus has been retired. Installing a third-party driver adds setup and support burden; choose the driver when this is scheduled.
- **Keybinding.** Players bind the virtual device's buttons and axes in the game's keybind settings. Generating an importable keybind profile could simplify this; feasibility unverified.
- **Weapons.** The API deliberately excludes weapons; a virtual device would not. Decide deliberately whether MFDIY offers weapon binds before shipping this.
- The document format and bridge protocol need a second kind of action (virtual button / axis output) alongside API actions.
- The primitive list reserves slider, knob and XY pad for this channel.

Status stays **Proposed** until it is scheduled and the driver and weapon questions are settled.
