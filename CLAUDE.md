# MFDIY

A no-code builder for custom browser-based MFDs (multi-function displays) driven by live game telemetry. First target: Star Citizen's local gRPC telemetry (introduced with Alpha 5.0). The goal is that players can build an MFD **without writing code**.

## Read first

Decision records live in [`docs/decisions/`](docs/decisions/). Read them before designing or building anything; they record choices already made and why. Add a new numbered record when a significant decision is made, rather than editing an accepted one.

- [0001: Responsive everywhere, including the builder](docs/decisions/0001-responsive-everywhere.md)
- [0002: Deep theming and customisation from day one](docs/decisions/0002-themable-from-day-one.md)
- [0003: Tech stack and styling architecture](docs/decisions/0003-tech-stack.md)
- [0004: Reaching the bridge on the local network](docs/decisions/0004-local-network-access.md)
- [0005: Keeping the display awake](docs/decisions/0005-keeping-the-display-awake.md)
- [0006: Builder grid, layouts and interaction](docs/decisions/0006-builder-grid-and-layouts.md)
- [0007: No scrolling, paging instead](docs/decisions/0007-no-scrolling.md)
- [0008: Builder interface layout](docs/decisions/0008-builder-interface-layout.md)
- [0009: In-place editing on the display](docs/decisions/0009-in-place-editing.md) (Proposed)
- [0010: How actions work on the display](docs/decisions/0010-actions-on-the-display.md)
- [0011: Virtual input device as a second action channel](docs/decisions/0011-virtual-input-device.md) (Proposed)
- [0012: Automatic profiles based on game context](docs/decisions/0012-automatic-profiles.md) (Proposed)

## Commands

Root (npm workspaces monorepo, Node 24):

- `npm run dev`: bridge (simulator, port 8420) and app dev server (http://localhost:4000, proxies `/ws` to the bridge)
- `npm run build`: build all workspaces; the bridge serves `apps/app/build/client`
- `npm start`: run the bridge, serving the built app on port 80, falling back to 8420 (`npm start -- --port 1234` to choose)
- `npm run typecheck`, `npm run lint`, `npm run format`
- `npm test`: Vitest across workspaces
- `npm run dev -w @mfdiy/ui` / `-w @mfdiy/instruments`: Storybook (ports 6006 / 6007)

## Layout

- `apps/app`: builder and display (React Router 7, SPA mode). Telemetry lives in `src/telemetry/TelemetryStore.ts`, outside React.
- `apps/bridge`: Node bridge. `source.ts` is the telemetry source interface; only the simulator exists so far.
- `packages/schema`: Valibot schemas for every public format: signals, bridge protocol, theme tokens, documents.
- `packages/instruments`: MFD primitives (pure), widgets and manifests (data-aware), the `--mfd-*` theme contract.
- `packages/ui`: builder design system, forked from Bonsai (`manage.vet`). One-way fork; prune freely.
- `packages/adapter-star-citizen`: Star Citizen signal and action catalogue.
- `packages/config`: shared TypeScript config.

## Code rules

- Validate all external input (bridge messages, shared themes and documents) with the schemas in `@mfdiy/schema`.
- In MFD styles, always read tokens through `token()` from `@mfdiy/instruments`, never `vars` directly; it resolves the base → semantic → component fallback chain at the point of use.
- Container query units resolve against an element's _ancestor_ container: put `cqmin` sizing on the inner `frame`, never on the `cell` container itself.
- `useEffect` is for synchronising with external systems only; derive values during render.

## Planned architecture

```
Game (local gRPC, localhost) ──▶ MFDIY bridge (gaming PC) ──WebSocket/JSON (LAN)──▶ MFD in a browser
```

- Browsers can't call native gRPC, so a bridge on the gaming PC is required. It holds the gRPC stream and fans frames out over WebSocket. It also forwards button presses as game actions.
- Star Citizen service: `sc.game.telemetry.v1.GameTelemetryService` with `TelemetryStream` (server-streaming, about 20 Hz), `TriggerGameAction` and `ListTriggerableActions`. The schema is unofficial and reverse-engineered; expect it to change between patches.
- The game's telemetry server has **no authentication**. Keep it bound to localhost; the bridge decides what reaches the LAN and allowlists which actions can be triggered.

## Conventions

- Commit straight to `main`.
- The landing page lives in `site/` and deploys to GitHub Pages via `.github/workflows/pages.yml`, served at https://mfdiy.app (custom domain set in the repository's Pages settings, not via a `CNAME` file).
- Don't use game trademarks ("Star Citizen", "RSI", "Verse") in the product name or branding. MFDIY is an unofficial fan project and should be able to support other games later.
