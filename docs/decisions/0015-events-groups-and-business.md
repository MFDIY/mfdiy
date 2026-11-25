# 0015: Events, groups and business offerings

- **Status:** Accepted
- **Date:** 2026-11-25

## Decision

Following 0013, these offerings are paid because their users profit from them or because they need servers.

### Included

1. **Caster dashboards.** Combine several pilots' telemetry into one view for races, tournaments and organised events. Needs a server relay; organisers often have sponsors, so the running costs are quickly recovered.
2. **Commercial licence for hardware sellers.** Sim-pit builders and MFD bezel makers bundling MFDIY or shipping presets for their products pay a licence or partnership fee.

### Maybe

3. **Fleet view.** Wingmates opt in to share hull, shields and fuel with each other's displays. Only if the game's terms allow it: seeing teammates' shields is a big advantage and would be very popular. Needs a server relay.

### Undecided

4. **Venue licence** for LAN centres and sim arcades using MFDIY commercially.

## Why

- Event organisers and businesses earn money with MFDIY or need infrastructure that costs money to run.
- Caster dashboards and fleet view are only possible with a relay, so a paid service is the honest way to provide them.

## Consequences

- Relay-based features (caster dashboards, fleet view, the viewer page from 0014) share one relay service; design it once.
- Participants must explicitly opt in before their telemetry leaves their PC.
- The game developer's terms must be checked before building fleet view.
