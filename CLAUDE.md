# MFDIY

A no-code builder for custom browser-based MFDs (multi-function displays) driven by live game telemetry. First target: Star Citizen's local gRPC telemetry (introduced with Alpha 5.0). The goal is that players can build an MFD **without writing code**.

## Read first

Decision records live in [`docs/decisions/`](docs/decisions/). Read them before designing or building anything; they record choices already made and why. Add a new numbered record when a significant decision is made, rather than editing an accepted one.

- [0001: Responsive everywhere, including the builder](docs/decisions/0001-responsive-everywhere.md)
- [0002: Deep theming and customisation from day one](docs/decisions/0002-themable-from-day-one.md)

## Planned architecture

```
Game (local gRPC, localhost) ──▶ MFDIY bridge (gaming PC) ──WebSocket/JSON (LAN)──▶ MFD in a browser
```

- Browsers can't call native gRPC, so a bridge on the gaming PC is required. It holds the gRPC stream and fans frames out over WebSocket. It also forwards button presses as game actions.
- Star Citizen service: `sc.game.telemetry.v1.GameTelemetryService` with `TelemetryStream` (server-streaming, about 20 Hz), `TriggerGameAction` and `ListTriggerableActions`. The schema is unofficial and reverse-engineered; expect it to change between patches.
- The game's telemetry server has **no authentication**. Keep it bound to localhost; the bridge decides what reaches the LAN and allowlists which actions can be triggered.

## Conventions

- Commit straight to `main`.
- The landing page lives in `site/` and deploys to GitHub Pages via `.github/workflows/pages.yml`.
- Don't use game trademarks ("Star Citizen", "RSI", "Verse") in the product name or branding. MFDIY is an unofficial fan project and should be able to support other games later.
