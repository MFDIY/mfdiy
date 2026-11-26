---
name: verify
description: How to check a change in MFDIY before committing — which checks to run for which kind of change, fast, how to look at UI and regression-test it through Storybook stories, and how to update Storybook. Use before every commit, whenever you want to see a component or builder state, and before touching Storybook dependencies.
---

# Verify a change

Run only what the change can break, scoped to the workspaces it touches. Don't write throwaway
scripts or install tools: everything needed is in the repository. The one exception is checking
hover and press with a real mouse (below). If something is missing, say
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
- **What they do**: every story renders, runs its `play` function and a11y checks, and is
  compared **exactly** with its baseline in `__screenshots__/` next to the story file.
- **Run only what's needed** (see "Choosing what runs" below). By default, while working:
  `npm run test:stories:changed`. Before committing a change to a shared package (`ui`,
  `instruments`, `schema`), run everything: `npm run test:stories`.
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

### What stories can't check, and pitfalls

- **Hover and press.** Storybook's `userEvent.hover` and `click` dispatch events; they never
  trigger CSS `:hover` or `:active`, so a story can't show or assert those states. To check one,
  run the package's Storybook and drive it with a real mouse in a short Playwright script (the
  `playwright` package is installed), reading `getComputedStyle` at rest, hovered and with the
  button held. Keep the script out of the repository, and say in the commit what you checked.
- **Hit areas.** `userEvent.click(element)` fires at that element, skipping the browser's hit
  testing. To test what a press at a point reaches (a label stretched over a row), click
  `document.elementFromPoint(x, y)`. See Switch's Toggling story.
- **Keyboard in lists.** Base UI highlights items a moment after opening; wait for
  `data-highlighted` on the expected item before the next key, or the test flakes under load.
- **Motion.** Story tests run with reduced motion, so components must honour
  `prefers-reduced-motion` for their screenshots to be stable.
- **Updating several folders.** `--update` with more than one path has been seen to run only some
  of them. Update one folder at a time, and check `git status` for the baselines you expected.
- **Stale styles.** Vitest's on-disk module cache is off in the shared projects
  (`packages/config/vitest.ts`), because a `.css.ts` is evaluated with what it imports. Leave it
  off; if styles ever look stale in Node tests, delete `node_modules/.vitest-cache`.

## Choosing what runs

The full suites keep growing, so run the smallest set that covers the change. These work for
`npm test` (unit) and `npm run test:stories` alike, per workspace; arguments after `--` go to
Vitest.

| Run                                                   | Command                                                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Stories affected by uncommitted changes, all packages | `npm run test:stories:changed`                                                            |
| Stories affected by everything on this branch         | `npm run test:stories --workspaces --if-present -- --changed origin/main`                 |
| One package                                           | `npm run test:stories -w @mfdiy/builder`                                                  |
| Files or folders                                      | `npm run test:stories -w @mfdiy/ui -- src/components/Button src/components/Text`          |
| Stories by name                                       | `npm run test:stories -w @mfdiy/builder -- -t "Palette With Bar"`                         |
| List the names to filter on                           | `npx vitest list --project storybook` (in the package folder)                             |
| Unit tests, same way                                  | `npm test -w @mfdiy/schema -- --changed`, `-- src/layoutEditing.test.ts`, `-- -t "grows"` |

- `--changed` follows imports across packages: a change in `ui` runs the builder stories that
  use it too. Changes to `package.json`, the lockfile or a Vitest config make it run everything.
- `-t` matches the full test name, `<file> > <story name>`, so a story name (spaced words, as
  `vitest list` shows it) matches on its own.
- `--update` can be combined with any of these, to accept only the baselines you meant to change.

## 3. Dependencies

Change dependencies with npm (`npm install -D <pkg> -w <workspace>`, `npm uninstall`), not by
editing a `package.json`. If you do edit one, run `npm install` afterwards. The pre-commit hook
re-syncs `package-lock.json` whenever a `package.json` is staged, so the committed lockfile is
what the maintainer's `npm install` produces; don't fight it.

A workspace's `peerDependencies` count as production dependencies in the lockfile. Use
`devDependencies` for tooling, including in `@mfdiy/config`.

### Storybook

Never edit Storybook versions by hand. Use its commands, which also run its migrations:

- Upgrade all three: `npx storybook@<version> upgrade --yes -c packages/ui/.storybook packages/instruments/.storybook packages/builder/.storybook`
- Add an addon: `npx storybook@<version> add <addon> --yes -c packages/<workspace>/.storybook`

Then review the diff: they may add addons nobody asked for, or write `"latest"` instead of a
version range. Raise added addons with the maintainer; pin versions; run section 2 for every
package.

## 4. Before committing

Report what you ran and the result, in your own words. A skipped check is said out loud, with why.
