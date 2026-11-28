# 0003: Tech stack and styling architecture

- **Status:** Accepted
- **Date:** 2026-11-24 (updated 2026-11-28, when the Windows download was built: a zip first)

## Decision

### Stack

- **TypeScript, React 19, React Router 7, Vite.** The maintainer's strongest stack; matches `manage.vet`.
- **vanilla-extract** for all styling, with **CSS custom properties as the theming mechanism**.
- **Own Pointer Events code** for drag, drop and resize in the builder; no drag-and-drop library (see 0006).
- **Valibot** for every schema (documents, themes, signal catalogues, bridge messages). Same choice as `manage.vet`.
- **npm workspaces monorepo**, laid out like `manage.vet`:

| Workspace                       | Purpose                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `apps/app`                      | Builder and display. React Router 7 in SPA mode (no SSR).                                                         |
| `apps/bridge`                   | Node app on the gaming PC: game gRPC → WebSocket. Also serves the built `apps/app` on the LAN (see consequences). |
| `packages/builder`              | The builder's canvas, and later its palette and properties. Independent of the page hosting it (0008).            |
| `packages/ui`                   | Builder chrome design system: Bonsai's styling contract, interactive parts on Base UI.                            |
| `packages/instruments`          | MFD primitives, widget manifests and the MFD theme contract.                                                      |
| `packages/schema`               | Valibot schemas and version migrations for documents, themes and signals.                                         |
| `packages/adapter-star-citizen` | Maps the game's telemetry to MFDIY's game-agnostic signal catalogue and actions.                                  |

**npm naming:** every published package lives under the **`@mfdiy` scope** (npm org owned by the maintainer), e.g. `@mfdiy/bridge`, `@mfdiy/ui`. The unscoped name `mfdiy` was rejected by npm's typo-squatting filter as too similar to `fdir`. The repository root package is `private`.

### Two styling systems, kept apart

**1. Builder chrome (`packages/ui`)**: a normal app design system, **forked from Bonsai** (`manage.vet/packages/bonsai`). It is a one-way copy: no syncing with Bonsai, and drift is accepted. Bonsai is as much a styling contract and its mechanisms as a set of components: reuse that pattern in full: `createGlobalThemeContract`, `createGlobalTheme`, Sprinkles with container, media and pseudo conditions, `Box` with style props, and Storybook. Bonsai's _looks_ are not kept: its tokens, themes and variants are rebuilt so the chrome and the MFDs share one design language and one set of semantic names (0022). Users never theme this, and a user's MFD theme can never affect it.

**Interactive components are built on Base UI** (`@base-ui/react`, MIT): unstyled primitives for sheets (Drawer), menus, tabs, selects, toggle groups, number fields and the like, which bring keyboard, focus and screen-reader behaviour. They are styled with the chrome's tokens through `Box` and style props, and imported per component (`@base-ui/react/drawer`), so only what's used is bundled. Bonsai's own components are only forked where Base UI has no equivalent, and the ones already rebuilt (Box, Text, Button, TextField, Dialog, layout) stay. **Only `packages/ui` imports Base UI.** It wraps each primitive in a component of its own with MFDIY's props and conventions (`Sheet`, `Menu`, `Tabs`, …), as Bonsai wraps Floating UI in `PopoverBase` and `ModalBase`. Apps and other packages use those components, never Base UI itself, so the library underneath can be replaced in one place. A lint rule enforces this.

**`Box` covers everything.** Code in `apps/app`, `packages/builder` and `packages/instruments` uses `Box` (or a component built on it) instead of native elements, and style props instead of CSS. `Box` is polymorphic, so `tagName` keeps the HTML semantic. `className` is only for styles Bonsai doesn't support, and adding that support to Bonsai is considered case by case first. Values are always Bonsai tokens, including those for editing controls on the canvas, which have the same value in every colour scheme so they stand out from any MFD theme. MFD styling keeps reading `--mfd-*` tokens.

**2. MFD layer (`packages/instruments`)**: what users build, theme and share. It uses the same vanilla-extract foundations, with three differences:

- **Its own contract with a public, prefixed namespace** (`--mfd-*`), created with `createGlobalThemeContract` so names are stable and readable. These names are a **public API**: shared themes depend on them, so changes are versioned and migrated (`packages/schema`).
- **Three token tiers**, so a simple theme sets only a few values and power users can still override everything: _primitive_ (role-named scales), _semantic_ (meaning) and _component_ (one part of one primitive). Each falls back to the tier below at the point of use, so it only needs setting to diverge. Tiers, naming and what a theme may set are in 0022.
- **Runtime themes via inline variables.** Built-in themes ship as `createGlobalTheme` defaults scoped to the MFD root. A user's theme JSON is validated, then applied with `assignInlineVars` (`@vanilla-extract/dynamic`) on the document, page or widget element. The CSS cascade gives the global → page → widget override chain from 0002 for free.

**`Box` for structure, `--mfd-*` for looks.** Primitives in `packages/instruments` use `Box` and style props for structure (layout, cursor, touch handling), and `--mfd-*` tokens through `className` for everything a theme can change. They don't use Bonsai's tokens for looks, because `--mfd-*` names are a public API, resolve through the three tiers, and keep user themes from reaching the editing controls that sit inside the MFD. They don't use Bonsai's `Button` either: MFD buttons fire on touch (0010), scale with their cell and show action status. MFD users never write JSX: their API is the **widget manifest** (bindable props, sizes, exposed tokens), and the builder generates editors from it. Visual states are exposed as data attributes (`data-state="caution"`) so they stay targetable if custom CSS is ever allowed (0002).

### Core abstractions (agreed)

- **Signal catalogue**: game-agnostic typed signals (number with range and unit, boolean, enum, string). Adapters map each game to it. Star Citizen first; other games crowd-sourced much later.
- **Binding**: signal → widget prop, with transforms (scale, clamp, thresholds, enum → label, format).
- **Action**: trigger a game action (with hold time), change page, or toggle local state; reports pending / ok / failed.
- **Primitives**: Button, Light, Readout, Bar, Dial, Toggle, Icon, Group. Pure, props only, no knowledge of data or editing.
- **Widget manifest**: declares bindable props and their types, default and minimum size, and themable tokens. The builder generates property panels from it and only offers compatible signals.
- **Document model**: document → pages → grid of widget instances (Groups nest), plus an edge-button rail aligned to physical bezels.
- **Renderer vs editor**: the same widgets render in both; the editor wraps instances in a frame for selection, drag and resize.
- **Telemetry store**: an external store outside React. Widgets subscribe per signal with `useSyncExternalStore`, so a 20 Hz stream re-renders only the widgets bound to changed signals.

### Packaging the bridge for Windows

Players on Windows get the bridge as **one zip, with Node in it**, so nothing needs installing first (no Node, npm or Git). A single `.exe` (Node SEA or similar) comes later; the zip is the first pass (0020).

- **What's in it:** a `MFDIY` folder with `MFDIY.cmd` (the launcher), a `README.txt`, the official portable `node.exe` for Windows x64 with its licence, the bridge bundled into one file by esbuild (`bridge/bridge.mjs`, with the licences of what it bundles), and the built app (`app/`). Not the monorepo, `node_modules` or `tsx`.
- **The launcher** starts the bridge with the bundled Node, passes on its own arguments, and keeps the window open when the bridge stops. Opened from inside the zip (Explorer extracts only that file), it says to extract the zip first.
- **The console is the bridge's window** for now (0004): what it's simulating or connected to, the QR code, the addresses, `/connect`, the firewall prompt and where profiles are saved.
- **The telemetry source is the bridge's choice, not the launcher's:** `--source simulator|game`, defaulting to the simulator while it's the only one. When the game connection exists, the default moves to it and the same launcher keeps working.
- **Profiles are saved outside the zip,** in the bridge's data folder (`%APPDATA%\MFDIY`), so replacing the folder with a newer version keeps them. The folder is always called `MFDIY`, so extracting a new version in the same place keeps the firewall rule Windows made for its `node.exe`.
- **Built on any OS** by `npm run package:windows`, which downloads a pinned Node version from nodejs.org at build time and checks it against the release's `SHASUMS256.txt`. The binary is never committed. A workflow builds the zip and keeps it as the run's artifact (`.github/workflows/windows-download.yml`), only when run by hand: not on every push, while there are no releases yet.

## Why

- Plays to the maintainer's strengths and reuses a proven design-system setup instead of inventing one.
- Bonsai's model ("finite semantic keys that resolve to CSS variables") is already right for user theming: a theme redefines variables and never needs new CSS. Only the namespace, tiers and runtime application are new.
- Keeping builder chrome and MFD styling separate means users can theme freely without ever breaking the editor, and each system can evolve on its own schedule.

## Consequences

- **The bridge serves the app on the LAN.** A page served over HTTPS (such as GitHub Pages) can't open an unencrypted `ws://` connection to a LAN IP; browsers block it as mixed content. So the builder and display are served by the bridge over HTTP on the LAN, the same origin as the WebSocket. The public site carries marketing material and a demo running on simulated data.
- Shared themes are **untrusted input**. Every token value is validated against its type (colour, length, number, font family, ...). Free-form values such as `url()` are rejected outside the asset mechanism, so a shared theme can't load remote content or track its users.
- Token names and theme JSON form a versioned public format. Renaming a token requires a schema version bump and a migration.
- Storybook is used for `packages/ui`, `packages/instruments` and `packages/builder`, and components are developed there first, in isolation. For instruments it doubles as the theme playground.

## Open questions

- **A single `.exe`** in place of the zip (Node SEA or similar), and auto-update. The zip comes first (see "Packaging the bridge for Windows").
  - **Code signing:** an unsigned download runs (the zip's `MFDIY.cmd` and `node.exe` included) but shows a SmartScreen warning ("More info → Run anyway"). Plan (see 0013): ship unsigned to early testers, then sign the open-source core through the **SignPath Foundation** (free for OSI-licensed open-source projects; the certificate names SignPath Foundation as publisher; requires a public repository, no proprietary components and automated CI builds). Paid add-ons are separate packages and are not covered by SignPath; how to sign them is decided when the first one ships.
