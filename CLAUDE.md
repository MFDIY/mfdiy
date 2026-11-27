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
- [0020: What the first public beta contains](docs/decisions/0020-launch-mvp.md)
- [0021: Testing and visual regression](docs/decisions/0021-testing.md)
- [0022: One design language for the brand and the MFDs](docs/decisions/0022-one-design-language.md)
- [0023: The properties panel](docs/decisions/0023-properties-panel.md)

## Working with the maintainer

- Discuss and align before recording a decision; the maintainer wants to agree on decisions, not receive them. Record each agreed decision in `docs/decisions/`, split into several records when they're separate decisions.
- Don't relitigate accepted decisions; build on them. Raise a concern only with new information, and then update the record.
- The builder is the part the maintainer most looks forward to; design it together rather than presenting finished interaction designs.

## Current state

Built: monorepo scaffold, schemas, theme contract v2 (0022), four MFD primitives, bridge with a telemetry **simulator**, a library of profiles saved on the bridge (0019), a display rendering one, and a builder that adds, moves, resizes and removes widgets, with undo and saving. The builder chrome is rebuilt on the `mfdiy` brand theme (Panel white, 0022), with these components in `packages/ui`, all on Base UI where it has a part: Button (with icons), IconButton, Icon (Material Symbols), Tooltip, Toggletip, Menu, Tabs (overflow into a "+N" menu), Field, TextInput, TextField, NumberField, Switch, Select, SegmentedControl, SearchList, Sheet, Sticky, Accordion, Group, Dialog, Toast (with an action, e.g. Undo), Logomark, PanelLayout and PanelTask. The widget library (0006, 0008) lists widget types, as a sidebar or a sheet through PanelLayout, with the **properties panel** (0023, first version) opposite it: page name and grid with Duplicate and Delete, or a widget's type, data with thresholds, action, options and place, with Duplicate and Remove. As sheets, side tasks stack (`PanelTask`): the sheets under the top one follow it, one step above, and the properties sheet peeks instead of closing (0008). The builder's header (`EditorHeader`, 0008) is one row over a full-width hairline: the logomark in the page's accent (the one coloured part of the chrome, 0022), Back between dividers, page Tabs with "+", undo / redo, Save (the accent while there's something to save) and a `⋯` menu; on a phone undo, redo and Save move into `⋯`. Not built yet: the real game connection, tap-to-engage and keep-awake, `mfdiy.local` and the QR code.

Next: **the first public beta (0020)**. Its scope, order and gates are agreed; don't reopen them without new information.

1. **Connect the bridge to the game** (critical path). **Blocked:** the game's telemetry feed was removed in a patch (27 Nov 2026); the launch waits for it to return (0020). The schema can be generated from the installed game; a real frame is still needed for units and the order of shield faces. See [`docs/research/star-citizen-telemetry.md`](docs/research/star-citizen-telemetry.md).
2. **Editor** (0006–0008), limited to what 0020 lists. The primitives it needs are built; A first version of the **properties panel** (0023) is built (`packages/builder/src/properties`, stories under Builder/PropertiesPanel); its looks are still to be worked out with the maintainer, and the widgets themselves are developer art, so don't polish them. Pages and the header are built (0008, 0023); the one-row header is on trial on phones. Next: the canvas redesign (zoomable and pannable), in its own session, before the widgets are redesigned.
   - Postponed: a split Save button (0008).
   - Not built yet from 0008: a keyboard shortcut that focuses the library's search; dragging from the library on touch (long-press).
3. **Windows download, QR code, tap-to-engage and keep-awake.**
4. **Starter profiles and built-in themes.** Where the choice of theme is kept is still open (0020).

The repository is public in the `MFDIY` org, and the landing page is live at https://mfdiy.app (HTTPS enforced).

Waiting on the maintainer: generate the schema on the gaming PC (PTU and LIVE) and put both files where a session can read them; confirm PTU access; read the game developer's terms before charging for anything, and its fan-content and posting rules before announcing the beta.

Known tech debt: React Router 8 is available (we're on 7, per 0003); ESLint 9 is no longer supported upstream; `npm audit` reports moderate advisories in dev tooling only (glob and minimatch, via `rimraf` and Storybook's React docgen; don't use `npm audit fix --force`, it makes breaking version changes); the Sprinkles setup still produces about 177 kB of builder CSS (20.5 kB gzipped), down from 656 kB before the chrome rebuild (0022); a cold type check of a package that imports `@mfdiy/ui` takes ~15 s; TextInput still uses `useMergeRefs` from `@floating-ui/react`, left over from Bonsai; Select's Keyboard Chooses story failed once under a full run (it waits for each highlight now).

## Commands

Root (npm workspaces monorepo, Node 24):

- `npm run dev`: bridge (simulator, port 8420) and app dev server (http://localhost:4000, proxies `/ws` to the bridge)
- `npm run build`: build all workspaces; the bridge serves `apps/app/build/client`
- `npm start`: run the bridge, serving the built app on port 80, falling back to 8420 (`npm start -- --port 1234` to choose, `--data <folder>` for where profiles are saved)
- `npm run lint`, `npm run format`
- `npm run typecheck`, incremental: seconds when warm, ~90 s cold or after changing `packages/ui`. Prefer `-w <workspace>` for what a change touches.
- `npm test`: unit tests across workspaces (seconds)
- `npm run test:stories`: every story of ui, instruments and builder in Chromium, compared with its baseline screenshot (0021); `-w <workspace> -- --update` accepts intended changes
- `npm run test:stories:changed`: only the stories affected by uncommitted changes; the `verify` skill lists the other ways to run fewer tests
- `npm run dev -w @mfdiy/ui` / `-w @mfdiy/instruments` / `-w @mfdiy/builder`: Storybook (ports 6006 / 6007 / 6008)
- `npm run icons -w @mfdiy/ui`: regenerate the icon paths after adding a Material Symbols name to `packages/ui/scripts/generate-icons.ts` (Sharp, weight 300; 0022)
- Update Storybook and add its addons only with its own commands, never by editing versions: `npx storybook@<version> upgrade --yes -c packages/ui/.storybook packages/instruments/.storybook packages/builder/.storybook`, and `npx storybook@<version> add <addon> --yes -c <config dir>`. Review what they change (0021).

Before committing, follow the `verify` skill (`.claude/skills/verify`).

## Layout

- `apps/app`: builder and display (React Router 7, SPA mode). Telemetry lives in `src/telemetry/TelemetryStore.ts`, outside React; saved documents in `src/documents/DocumentStore.ts`, over the same connection.
- `apps/bridge`: Node bridge. `source.ts` is the telemetry source interface; only the simulator exists so far. `library.ts` saves documents; during development in `apps/bridge/.data`.
- `packages/schema`: Valibot schemas for every public format: signals, bridge protocol, theme tokens, documents.
- `packages/instruments`: MFD primitives (pure), widgets and manifests (data-aware), the `--mfd-*` theme contract.
- `packages/builder`: the builder's canvas and palette (`PageEditor`), independent of the page hosting them. Develop it in Storybook first.
- `packages/ui`: builder design system: Bonsai's styling contract (tokens, Sprinkles, `Box`), with interactive components built on Base UI (0003, 0022). Chrome colours are private tokens in `src/styles/themes/chrome.ts`, resolved from the `mfdiy` theme; style props expose them by role (`line`, `line.strong`, `line.bright`, `hover`, …), never primitive steps.
- `packages/adapter-star-citizen`: Star Citizen signal and action catalogue, and the starter documents a new library gets.
- `packages/config`: shared TypeScript config.

## Code rules

- Validate all external input (bridge messages, shared themes and documents) with the schemas in `@mfdiy/schema`.
- In `apps/app`, `packages/builder` and `packages/instruments`, use `Box` and other Bonsai components instead of native elements, and style props instead of CSS (0003). `className` or `style` on a Bonsai component is a code smell (0022): check `packages/ui/src/styles/properties.ts`, and if a style or scale value is missing, raise it with the maintainer rather than work around it. Allowed: MFD looks from `--mfd-*` tokens through `className`, and values computed from the document, wrapped in components such as `LayoutGrid` and `LayoutArea`.
- Style Base UI's parts (inside `packages/ui` only) with `className={designSystem({ … })}`, or a function of the part's state (`state => designSystem({ backgroundColor: state.highlighted ? 'hover' : 'transparent' })`), so they reuse Sprinkles' classes. A `.css.ts` is only for what Sprinkles can't express, such as Base UI's CSS variables and `data-*` transition attributes.
- A style prop with a `hover` value also needs an `active` value (usually the same): Sprinkles' `hover` and `focusWithin` don't apply while an element is pressed, so without one the colour falls back to its default on mousedown and flickers until release.
- **Layout components size things; UI components fill what they're given.** A field, button, list or panel never sets its own width or flex share, pads itself or scrolls itself; it touches the edges of its container and adapts through container queries. Whatever places it decides its size, padding and scrolling: a `Box` inside `Columns`, `Stack`, `ScrollContainer`, `PanelLayout`'s sidebars, `Sheet`, the page. Bonsai's `Columns` assumes its children are such layout `Box`es. A part that must stay in view while its container scrolls (a search field) is `position: sticky`, on `backgroundColor='inherit'`.
- Base UI is imported only inside `packages/ui` (lint enforces it), wrapped in our components (0003). When a component starts using a new Base UI part, add it to `optimizeDeps.include` in `packages/config/vitest.ts`, or Vite reloads mid-run and story tests fail at random.
- Parts of a field (an input and its buttons, a select and its ×) sit in one box from `Field/fieldStyles.ts`: `fieldBoxClass` brightens with hover, focus and press; `fieldButtonClass` is a square button behind a hairline that inherits the box's border colour. A group of options (SegmentedControl) keeps a fixed frame instead (0022).
- Keep the properties of props types (and similar type definitions) in alphabetical order.
- Comment only what the code can't say: doc comments on exported components, hooks and props, with decision references. No inline comments explaining small implementation details.
- Pressable MFD elements use `pressHandlers` from `@mfdiy/instruments`, so they fire on touch (0010).
- In MFD styles, always read tokens through `token()` (from `@mfdiy/schema`, re-exported by `@mfdiy/instruments`), never `vars` directly; it resolves the primitive → semantic → component fallback chain at the point of use.
- `body` is the root container, so container queries also work in popups (rendered at the end of the page) and in parts that span the page. Something that spans the page and has a popup (the builder's header) shouldn't be a container itself, so it and its popup answer to the same width.
- Container query units resolve against an element's _ancestor_ container: build primitives on `Frame`, whose outer cell is the container, and put `cqmin` sizing on the frame.
- `useEffect` is for synchronising with external systems only; derive values during render.
- Keep components driven by props, so every state worth checking can be a story; stories are the UI tests (0021).
- Every component has a Documentation page in Storybook (`autodocs`) and a `Default` story whose props are all `undefined` or their default values. Pages of examples that aren't a component (e.g. `Instruments/Tokens`) opt out with `!autodocs`.
- In stories, every prop with a fixed set of values (variant, size, width, …) is picked from a list. Export the values from the component (e.g. `variants` in `props/Variant.ts`) and build the control from it (`createArgTypeFromConditionalStyleProp` from `packages/ui/.storybook/` in `ui`, a `select` control elsewhere), so Storybook can't drift from the code. Boolean props always get `false` in the story's `args` (otherwise the control shows a "Set boolean" button instead of a toggle), and props that take content (`children`, `actions`, other elements) get `control: false`.
- Form components are controlled (the page owns the value). Their stories hold the value in local state, keyed on the control, so the field can be used in Storybook; Storybook's `useArgs` doesn't re-render in story tests. See `TextField.stories.tsx`.

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
