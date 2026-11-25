# 0012: Automatic profiles based on game context

- **Status:** Proposed
- **Date:** 2026-11-24

## Context

The community's reverse-engineering notes on the game's telemetry describe:

- vehicle identity: ship name, class, manufacturer and type, present when seated in or flying a vehicle;
- the player's locomotion (`ON_FOOT`, `EVA`, `SEATED`), crew role (`PILOT`, `GUNNER`, `CREW`) and seat name (e.g. `pilot_seat`, `turret_top`);
- `ENTER_SEAT` / `LEAVE_SEAT` events.

Exact field names and real values (display names or internal codes, how manufacturers are spelled) are not known yet.

## Decision

### Profiles and conditions

- A **profile** (a saved MFD document, 0019) has **conditions** that say when it activates automatically. It never includes a theme.
- The display switches to the best-matching profile whenever the game context changes: entering a ship, moving to a turret, getting out and walking around.
- **Theme rules are separate from profile rules**: themes have conditions of their own, so one profile can be used in many ships and wear different colours and other token values per manufacturer or ship.

### Conditions are generic

Conditions are built from **context signals**, not hard-coded game concepts, so the feature stays game-agnostic:

- Adapters mark which signals are suitable as context (e.g. `vehicle.name`, `vehicle.manufacturer`, `vehicle.type`, `player.seat`, `player.role`, `player.locomotion`). These are ordinary enum or string signals, usable in widgets too.
- A condition is `signal` + operator (`is`, `is one of`, `is not`) + values. A profile's conditions are combined with **AND**; a profile with no conditions is a fallback.

### Choosing between matches

- The **most specific** match wins: more conditions beat fewer; a condition on a more specific signal (ship over manufacturer over type) beats a broader one. Adapters rank context signals by specificity.
- Ties are broken by the order of profiles in the user's list.
- **Debounce:** switch only after the context has been stable for a short time (about 2 seconds), so brief seat changes or loading glitches don't make the display flicker.
- **Manual override:** the user can pin a profile on the display, which suspends automatic switching until unpinned. Switching never happens while editing (0009).

### Builder: condition editor

- Each profile has an **"Activates when"** section: add a condition, pick a context signal, an operator and values.
- Values are offered from what the bridge **has seen** (ships the player has actually sat in, manufacturers, seats), plus free text, since the full list of the game's vehicles isn't known in advance.
- The builder shows **which profile is active right now and why** (which conditions matched), using live context from the bridge. This makes rules easy to test: sit in the ship, see the result.
- The profile list can be reordered to settle ties.

### Themes and trademarks

Conditions may use manufacturer names, since they come from the game's data. **Built-in themes may use colours and other token values inspired by a manufacturer, but not its name, logo, artwork or fonts** (see the trademark rule in CLAUDE.md); they get generic names (e.g. "Industrial Amber") and are never promoted as a manufacturer's theme. Users can map themes to manufacturers themselves and share their own.

## Why

- The right MFD depends on where the player is: a fighter, a mining ship, a turret seat or on foot. Switching automatically removes the last manual step between sitting down and flying.
- Generic context signals keep the core game-agnostic and let crowd-sourced adapters for other games use the same feature.
- Showing "active because …" makes rule-based behaviour predictable instead of magical.

## Consequences

- The Star Citizen adapter gains context signals (vehicle name, manufacturer, type; seat, role, locomotion) once real values are known.
- The bridge remembers context values it has seen, to offer them in the builder.
- The library (0019) also needs to hold themes, and the conditions of profiles and themes.
- Specificity ranking is part of the adapter contract.

Status stays **Proposed** until real telemetry values are known and the library format is designed.
