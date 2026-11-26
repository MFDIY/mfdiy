---
name: verify
description: How to check a change in MFDIY before committing — which checks to run for which kind of change, fast, how to look at UI and regression-test it through Storybook stories, and how to update Storybook. Use before every commit, whenever you want to see a component or builder state, and before touching Storybook dependencies.
---

# Verify a change

Run only what the change can break, scoped to the workspaces it touches. Don't write throwaway
scripts or install tools: everything needed is in the repository. If something is missing, say
so instead of working around it. Background: decision 0021.

## 0. Fresh worktree

A new worktree has no `node_modules`: run `npm ci` once (seconds). Playwright's Chromium is shared
across worktrees; if story tests say it's missing, run `npx playwright install chromium`.

## 1. Logic: types, lint, unit tests

- **Types**, per touched workspace: `npm run typecheck -w <workspace>`. It's incremental: a rerun
  takes about a second. The first run in a worktree, and any run after changing `packages/ui`,
  takes ~20 s per package that imports `@mfdiy/ui` (~90 s for the root `npm run typecheck`), so
  only run the root one when a shared package (`schema`, `ui`, `instruments`) changed.
- **Lint**, only changed files: `npx eslint --fix <files>`. The commit hook lints and formats too.
- **Unit tests**: `npm test -w <workspace>`, or `npm test` for the repository (seconds).

## 2. UI: stories are the tests

Components are driven by props, so every state worth checking is a story. To check a state, find
or write a story for it, never a script that clicks through the app.

- **Test stories** only pin a state worth checking (the palette open with Bar highlighted, a
  widget at its smallest). Tag them `!dev`: hidden in Storybook's sidebar, still tested. Reach the
  state through args where possible; use a `play` function only for what props can't express
  (focus, hover, an open popover, typing).
- **Run them**: `npm run test:stories -w <workspace>` (or root `npm run test:stories`, ~10 s for
  everything). Every story renders, runs its `play` function and a11y checks, and is compared
  **exactly** with its baseline in `__screenshots__/` next to the story file. Pass a path to run
  fewer: `npm run test:stories -w @mfdiy/builder -- src/canvas`.
- **Opt out** of the screenshot, per story or per file (`meta`), with the `!visual` tag, for
  anything that can't render the same twice. Still tested otherwise.
- **A failing comparison** reports how many pixels differ and writes the new screenshot and a diff
  image (red: changed pixels) to `<workspace>/.vitest/attachments/`; the failure output names
  them. Read both. Unintended: fix the code. Intended: accept with
  `npm run test:stories -w <workspace> -- --update <path>`, then read the new baseline, and list
  in the commit message which stories changed and why.
- **New stories** get a baseline on their first run. Always read a new baseline before
  committing it: it's what every future run is held to.
- **Looking at something yourself**: write or pick the story, run it, and read its baseline or
  `actual` image. The maintainer checks the look in Storybook (`npm run dev -w <workspace>`), so
  name the story to open.

## 3. Storybook dependencies

Never edit Storybook versions by hand. Use its commands, which also run its migrations:

- Upgrade all three: `npx storybook@<version> upgrade --yes -c packages/ui/.storybook packages/instruments/.storybook packages/builder/.storybook`
- Add an addon: `npx storybook@<version> add <addon> --yes -c packages/<workspace>/.storybook`

Then review the diff: they may add addons nobody asked for, or write `"latest"` instead of a
version range. Raise added addons with the maintainer; pin versions; run section 2 for every
package.

## 4. Before committing

Report what you ran and the result, in your own words. A skipped check is said out loud, with why.
