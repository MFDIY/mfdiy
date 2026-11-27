# 0020: What the first public beta contains

- **Status:** Accepted
- **Date:** 2026-11-25

## Context

Several telemetry tools for the game appeared within days of its telemetry becoming available. MFDIY needs to reach players soon, so the first release is the smallest one that delivers the promise: **a player downloads it, connects the game and flies with an MFD they made their own, in about 10 minutes.**

## Decision

### Must have

1. **Game connection:** telemetry, reconnecting, clear "no game" and "not in a ship" states, and `user.cfg` lines to copy. MFDIY doesn't edit the file itself yet.
2. **Actions:** only safe ones from the allowlist. Destructive actions stay out until the guarded button (0010) exists.
3. **Editor:** add, delete, duplicate and label widgets; bind a signal or action; thresholds; pages; at least one level of undo.
4. **Widgets:** the four that exist (Light, Bar, Readout, Button), with the annunciators added as signals to bind.
5. **Starting point:** three polished starter profiles and three built-in themes to pick from.
6. **Connecting a tablet:** QR code and IP address (0004), tap to engage and keep-awake (0005).
7. **Windows download:** an unsigned `.exe`, or a zip with Node and a launcher if packaging an `.exe` takes too long (0003).

### If time allows, in this order

1. Export and import of profiles.
2. The simulated-data demo on the public site (0003).
3. Vertical bar.
4. Dial.

### After the beta

`mfdiy.local`, theme editor, zoom, preview switcher, full undo history, automatic profiles (0012), virtual input device (0011), accounts and billing (0017), creator tools (0014) and the co-pilot (0016). These are **postponed, not dropped**: 0014 and 0016 stand and remain MFDIY's intended edge.

### Order and gates

- **The game connection is the critical path**, not the builder. The editor, the connection, and packaging with the QR code can be built in parallel sessions.
- **First gate:** real ship data on a real tablet. If it isn't met, **drop actions** from the beta.
- **The beta doesn't launch on simulated data.** Without real data the launch moves.
  - On 27 November 2026 the game's telemetry feed was removed in a patch, so the first gate can't be met and the launch moves until the feed returns. Meanwhile work continues on the editor's must-haves.
- A small **private beta** comes before the public one, followed by fixes only.
- The release is called a **beta**. It supports both game versions where possible; see [the telemetry notes](../research/star-citizen-telemetry.md).

## Why

- Other tools can copy features quickly. Looks, an easy setup and reliability with the real game are what a first impression rests on.
- Anything that needs accounts, servers or new drivers would delay every player for features few can use yet.

## Open questions

- **Where the choice of theme is kept.** A profile never holds or points at a theme (0019). Per display device is the obvious candidate, but it isn't decided.
- **`.exe` or zip** is decided while building it.
- Confirm that the maintainer's PC has PTU access; otherwise actions can't be tested (reported as 5.0 only).
