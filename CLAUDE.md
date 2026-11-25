# MFDIY

A no-code builder for custom browser-based MFDs (multi-function displays) driven by live game telemetry. First target: Star Citizen's local gRPC telemetry (introduced with Alpha 5.0). The goal is that players can build an MFD **without writing code**.

## Read first

Decision records live in [`docs/decisions/`](docs/decisions/). Read them before designing or building anything; they record choices already made and why. They are **living documents**: when a decision changes or an open question is settled, edit the existing record so it always reflects the current decision. Add a new numbered record only for a new, separate decision.

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
- [0013: Free to play, paid to profit or to host](docs/decisions/0013-free-to-play-paid-to-profit.md)
- [0014: Creator subscription](docs/decisions/0014-creator-subscription.md)
- [0015: Events, groups and business offerings](docs/decisions/0015-events-groups-and-business.md)
- [0016: Co-pilot suggestions powered by Jev](docs/decisions/0016-copilot-suggestions.md)
- [0017: Billing with Stripe](docs/decisions/0017-billing-with-stripe.md)
- [0018: Widget primitives](docs/decisions/0018-widget-primitives.md) (Proposed)
- [0019: Saving profiles](docs/decisions/0019-saving-profiles.md)

## Working with the maintainer

- Discuss and align before recording a decision; the maintainer wants to agree on decisions, not receive them. Record each agreed decision in `docs/decisions/`, split into several records when they're separate decisions.
- Don't relitigate accepted decisions; build on them. Raise a concern only with new information, and then update the record.
- The builder is the part the maintainer most looks forward to; design it together rather than presenting finished interaction designs.

## Current state

Built: monorepo scaffold, schemas, theme contract, four primitives, bridge with a telemetry **simulator**, a library of profiles saved on the bridge (0019), a display rendering one, and a builder that adds, moves, resizes and removes widgets, with undo and saving. Not built yet: the rest of the builder, the real game connection, tap-to-engage and keep-awake, `mfdiy.local` and the QR code.

Next steps:

1. **Rest of the builder** (0006–0008): properties panel (next; design it with the maintainer), pages, grid size control, preview switcher, zoom. Until properties exist, a placed widget's data, action and label can't be changed, and a Light can't be given an action.
2. **Connect the bridge to the game**: needs one real frame from the maintainer's PC to map field names. See [`docs/research/star-citizen-telemetry.md`](docs/research/star-citizen-telemetry.md).

The repository is public in the `MFDIY` org, and the landing page is live at https://mfdiy.app (HTTPS enforced).

Waiting on the maintainer: read the game developer's terms before charging for anything.

Known tech debt: React Router 8 is available (we're on 7, per 0003); ESLint 9 is no longer supported upstream; `npm audit` reports advisories in dev tooling only (Vitest 3, including two critical via `tinypool`, and Storybook's glob dependency; don't use `npm audit fix --force`, it makes breaking version changes); the Sprinkles setup forked from Bonsai produces about 656 kB of builder CSS (54 kB gzipped) and can be pruned.

## Commands

Root (npm workspaces monorepo, Node 24):

- `npm run dev`: bridge (simulator, port 8420) and app dev server (http://localhost:4000, proxies `/ws` to the bridge)
- `npm run build`: build all workspaces; the bridge serves `apps/app/build/client`
- `npm start`: run the bridge, serving the built app on port 80, falling back to 8420 (`npm start -- --port 1234` to choose, `--data <folder>` for where profiles are saved)
- `npm run typecheck`, `npm run lint`, `npm run format`
- `npm test`: Vitest across workspaces
- `npm run dev -w @mfdiy/ui` / `-w @mfdiy/instruments` / `-w @mfdiy/builder`: Storybook (ports 6006 / 6007 / 6008)

## Layout

- `apps/app`: builder and display (React Router 7, SPA mode). Telemetry lives in `src/telemetry/TelemetryStore.ts`, outside React; saved documents in `src/documents/DocumentStore.ts`, over the same connection.
- `apps/bridge`: Node bridge. `source.ts` is the telemetry source interface; only the simulator exists so far. `library.ts` saves documents; during development in `apps/bridge/.data`.
- `packages/schema`: Valibot schemas for every public format: signals, bridge protocol, theme tokens, documents.
- `packages/instruments`: MFD primitives (pure), widgets and manifests (data-aware), the `--mfd-*` theme contract.
- `packages/builder`: the builder's canvas and palette (`PageEditor`), independent of the page hosting them. Develop it in Storybook first.
- `packages/ui`: builder design system, forked from Bonsai (`manage.vet`). One-way fork; prune freely.
- `packages/adapter-star-citizen`: Star Citizen signal and action catalogue, and the starter documents a new library gets.
- `packages/config`: shared TypeScript config.

## Code rules

- Validate all external input (bridge messages, shared themes and documents) with the schemas in `@mfdiy/schema`.
- In `apps/app`, `packages/builder` and `packages/instruments`, use `Box` and other Bonsai components instead of native elements, and style props instead of CSS (0003). Before using `className`, check `packages/ui/src/styles/properties.ts`: if a style is missing, consider adding it there. In MFD primitives, looks come from `--mfd-*` tokens through `className`.
- Pressable MFD elements use `pressHandlers` from `@mfdiy/instruments`, so they fire on touch (0010).
- In MFD styles, always read tokens through `token()` from `@mfdiy/instruments`, never `vars` directly; it resolves the base → semantic → component fallback chain at the point of use.
- Container query units resolve against an element's _ancestor_ container: build primitives on `Frame`, whose outer cell is the container, and put `cqmin` sizing on the frame.
- `useEffect` is for synchronising with external systems only; derive values during render.

## Planned architecture

```
Game (local gRPC, localhost) ──▶ MFDIY bridge (gaming PC) ──WebSocket/JSON (LAN)──▶ MFD in a browser
```

- Browsers can't call native gRPC, so a bridge on the gaming PC is required. It holds the gRPC stream and fans frames out over WebSocket. It also forwards button presses as game actions.
- Everything known about the game's telemetry is in [`docs/research/star-citizen-telemetry.md`](docs/research/star-citizen-telemetry.md).
- Star Citizen service: `sc.game.telemetry.v1.GameTelemetryService` with `TelemetryStream` (server-streaming, about 20 Hz), `TriggerGameAction` and `ListTriggerableActions`. The schema is unofficial and reverse-engineered; expect it to change between patches.
- The game's telemetry server has **no authentication**. Keep it bound to localhost; the bridge decides what reaches the LAN and allowlists which actions can be triggered.

## Conventions

- Repository: `MFDIY/mfdiy` (the `MFDIY` GitHub org). Commit straight to `main`.
- The core is MIT. Paid add-ons (0013) live outside the core in separately licensed packages; never put paywalled code in MIT packages.
- The landing page lives in `site/` and deploys to GitHub Pages via `.github/workflows/pages.yml`, served at https://mfdiy.app (custom domain set in the repository's Pages settings, not via a `CNAME` file).
- Don't use game trademarks ("Star Citizen", "RSI", "Verse") in the product name or branding. MFDIY is an unofficial fan project and should be able to support other games later.
