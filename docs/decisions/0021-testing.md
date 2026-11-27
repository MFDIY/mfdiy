# 0021: Testing and visual regression

- **Status:** Accepted
- **Date:** 2026-11-26

## Decision

### Stories are the tests for UI

- Components stay "stupid": mostly driven by props, with few smarts inside, so every state worth checking can be a **story**.
- Every story in `packages/ui`, `packages/instruments` and `packages/builder` runs as a test through Storybook's **Vitest addon**, in Chromium (Vitest browser mode with Playwright). It renders, runs its `play` function and accessibility checks (reported, not failing yet), and is **compared with a baseline screenshot**.
- **Test stories** only pin a state worth checking, e.g. the palette open with a widget highlighted. They're tagged `!dev`, so they're hidden from Storybook's sidebar but still tested. A state comes from props where possible; a `play` function is only for what props can't express, like focus, hover or an open popover.
- Previews give every story the `visual` tag. A story, or a whole file, opts out of the screenshot with `!visual`.

### Local visual regression, not Chromatic

- Baselines are PNGs committed **next to the stories** (`__screenshots__/`), named per browser and platform. Comparison is **exact**: no pixel may differ. Changing a baseline is a deliberate step (`--update`), and the commit says which stories changed and why.
- Chromatic was considered: it's what the maintainer uses for a design system at work. It's cloud-only, and the free plan's 5,000 snapshots a month would last about 12 builds once stories are shot in two themes and three sizes, while this repository commits to `main` many times a day. Sessions also couldn't review its diffs, whereas local diff images can be read by anyone working in the repository.

### Fast checks

- `npm test` runs unit tests only (seconds). `npm run test:stories` runs every story in the browser (about 10 seconds for the repository).
- TypeScript checks **incrementally**, keeping build info per package in `node_modules/.cache/tsc`. Every package imports `@mfdiy/ui`'s source, not built types, so each one re-checks its polymorphic types (about 22 s per package, 90 s for the repository). Incremental checking makes reruns take seconds, but a change in `packages/ui` still costs the full time.
- The shared setup lives in `@mfdiy/config/vitest`, so the three packages configure tests the same way.

### Hooks and other logic without a look

Pure logic gets plain unit tests. A hook is tested through a small story that drives it, running in the same browser as every other story (e.g. `Widgets / Held states`). No second, simulated DOM such as jsdom with React Testing Library: it can behave differently from the browser (layout, `:has()`, popovers). If many such tests ever make stories awkward, use `vitest-browser-react`, which renders in the same real browser.

### Storybook updates through Storybook

- Storybook and its addons are updated and added with Storybook's own commands, never by editing versions by hand: `npx storybook@<version> upgrade --yes -c packages/ui/.storybook packages/instruments/.storybook packages/builder/.storybook` and `npx storybook@<version> add <addon> --yes -c <config dir>`. They also run Storybook's migrations. Review what they change: they may add addons or write unpinned versions.

## Why

- The design system's blast radius is large, and a reviewer looking at the builder easily misses a regression elsewhere. Exact screenshots of every story catch it.
- Stories double as documentation and as the place the maintainer checks the look, so testing through them costs no extra code.
- Every session used to build its own way of checking a change (installing Playwright, writing click-through scripts), which was slow and was thrown away each time.

## Consequences

- Baselines are only valid on the machine type that made them (currently macOS). Running them in CI on Linux needs its own baselines, made in a pinned container; that's left for later.
- Builder chrome in Storybook must render as it does in the app, including what's portalled out of the story (e.g. ui's preview puts its theme class on the root).
- If typechecking `packages/ui` changes keeps hurting, the next step is building ui to declaration files (or pruning its Sprinkles), so consumers stop re-checking its source.
