# 0003: Tech stack and styling architecture

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

### Stack

- **TypeScript, React 19, React Router 7, Vite.** The maintainer's strongest stack; matches `manage.vet`.
- **vanilla-extract** for all styling, with **CSS custom properties as the theming mechanism**.
- **Valibot** for every schema (documents, themes, signal catalogues, bridge messages). Same choice as `manage.vet`.
- **npm workspaces monorepo**, laid out like `manage.vet`:

| Workspace                       | Purpose                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `apps/app`                      | Builder and display. React Router 7 in SPA mode (no SSR).                                                         |
| `apps/bridge`                   | Node app on the gaming PC: game gRPC → WebSocket. Also serves the built `apps/app` on the LAN (see consequences). |
| `packages/ui`                   | Builder chrome design system, forked from Bonsai.                                                                 |
| `packages/instruments`          | MFD primitives, widget manifests and the MFD theme contract.                                                      |
| `packages/schema`               | Valibot schemas and version migrations for documents, themes and signals.                                         |
| `packages/adapter-star-citizen` | Maps the game's telemetry to MFDIY's game-agnostic signal catalogue and actions.                                  |

**npm naming:** every published package lives under the **`@mfdiy` scope** (npm org owned by the maintainer), e.g. `@mfdiy/bridge`, `@mfdiy/ui`. The unscoped name `mfdiy` was rejected by npm's typo-squatting filter as too similar to `fdir`. The repository root package is `private`.

### Two styling systems, kept apart

**1. Builder chrome (`packages/ui`)**: a normal app design system, **forked from Bonsai** (`manage.vet/packages/bonsai`). It is a one-way copy: no syncing with Bonsai, and drift is accepted. Fork selectively, bringing over only the components the builder needs, and prune freely. Reuse the Bonsai pattern in full: `createGlobalThemeContract`, `createGlobalTheme`, Sprinkles with container, media and pseudo conditions, `Box` with style props, and Storybook. Users never theme this, and a user's MFD theme can never affect it.

**2. MFD layer (`packages/instruments`)**: what users build, theme and share. It uses the same vanilla-extract foundations, with three differences:

- **Its own contract with a public, prefixed namespace** (`--mfd-*`), created with `createGlobalThemeContract` so names are stable and readable. These names are a **public API**: shared themes depend on them, so changes are versioned and migrated (`packages/schema`).
- **Three token tiers**, so a simple theme sets only a dozen values and power users can still override everything:
  1. _Base_: palette, font families, base size, glow, radius (`--mfd-color-primary`, `--mfd-font-display`).
  2. _Semantic_: meaning-based states (`--mfd-state-on`, `--mfd-state-caution`, `--mfd-state-warning`, `--mfd-surface`).
  3. _Component_: per-primitive tokens (`--mfd-light-on-bg`, `--mfd-bar-track`). Each falls back to its semantic token with `fallbackVar()`, so it only needs setting to diverge.
- **Runtime themes via inline variables.** Built-in themes ship as `createGlobalTheme` defaults scoped to the MFD root. A user's theme JSON is validated, then applied with `assignInlineVars` (`@vanilla-extract/dynamic`) on the document, page or widget element. The CSS cascade gives the global → page → widget override chain from 0002 for free.

**No Sprinkles in `packages/instruments`.** Sprinkles gives _developers_ a constrained style-prop API in JSX. MFD users never write JSX: their API is the **widget manifest** (bindable props, sizes, exposed tokens), and the builder generates editors from it. Primitives use plain `style()` and the token contract. Visual states are exposed as data attributes (`data-state="caution"`) so they stay targetable if custom CSS is ever allowed (0002).

### Core abstractions (agreed)

- **Signal catalogue**: game-agnostic typed signals (number with range and unit, boolean, enum, string). Adapters map each game to it. Star Citizen first; other games crowd-sourced much later.
- **Binding**: signal → widget prop, with transforms (scale, clamp, thresholds, enum → label, format).
- **Action**: trigger a game action (with hold time), change page, or toggle local state; reports pending / ok / failed.
- **Primitives**: Button, Light, Readout, Bar, Dial, Toggle, Icon, Group. Pure, props only, no knowledge of data or editing.
- **Widget manifest**: declares bindable props and their types, default and minimum size, and themable tokens. The builder generates property panels from it and only offers compatible signals.
- **Document model**: document → pages → grid of widget instances (Groups nest), plus an edge-button rail aligned to physical bezels.
- **Renderer vs editor**: the same widgets render in both; the editor wraps instances in a frame for selection, drag and resize.
- **Telemetry store**: an external store outside React. Widgets subscribe per signal with `useSyncExternalStore`, so a 20 Hz stream re-renders only the widgets bound to changed signals.

## Why

- Plays to the maintainer's strengths and reuses a proven design-system setup instead of inventing one.
- Bonsai's model ("finite semantic keys that resolve to CSS variables") is already right for user theming: a theme redefines variables and never needs new CSS. Only the namespace, tiers and runtime application are new.
- Keeping builder chrome and MFD styling separate means users can theme freely without ever breaking the editor, and each system can evolve on its own schedule.

## Consequences

- **The bridge serves the app on the LAN.** A page served over HTTPS (such as GitHub Pages) can't open an unencrypted `ws://` connection to a LAN IP; browsers block it as mixed content. So the builder and display are served by the bridge over HTTP on the LAN, the same origin as the WebSocket. The public site carries marketing material and a demo running on simulated data.
- Shared themes are **untrusted input**. Every token value is validated against its type (colour, length, number, font family, ...). Free-form values such as `url()` are rejected outside the asset mechanism, so a shared theme can't load remote content or track its users.
- Token names and theme JSON form a versioned public format. Renaming a token requires a schema version bump and a migration.
- Storybook is used for both `packages/ui` and `packages/instruments`. For instruments it doubles as the theme playground.

## Open questions

- **Packaging the bridge** for non-technical Windows users (a single `.exe` via Node SEA or similar, auto-update, firewall prompt).
  - **Code signing** is optional; an unsigned `.exe` runs but shows a SmartScreen warning ("More info → Run anyway"). Current lean: ship unsigned to early testers, then apply to the **SignPath Foundation** (free signing for OSI-licensed open-source projects; the certificate names SignPath Foundation as publisher; requires a public repo, no proprietary components and automated CI builds). Microsoft Artifact Signing (~US$10/month) paused individual sign-ups in 2025; a commercial certificate (~US$200–400/year) only makes sense if MFDIY is monetised.
- **Drag-and-drop library**: dnd-kit is the leading candidate (pointer and keyboard sensors); evaluate against 0001 before committing.
