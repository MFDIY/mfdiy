# 0022: One design language for the brand and the MFDs

- **Status:** Accepted (the token list itself is still being drafted)
- **Date:** 2026-11-26

## Decision

### Bonsai's looks are rebuilt from scratch

Everything in `packages/ui` that decides how things look (its token contract, its themes, its component variants) is replaced. Bonsai's mechanics stay as 0003 describes them: `createGlobalThemeContract`, Sprinkles, `Box` with style props and Storybook. Component variants that no longer make sense are dropped rather than restyled.

### One vocabulary, two scopes

- The builder chrome and the MFDs use the **same token tiers and the same semantic names** (`surface`, `text`, `accent`, `status.caution`, …), so the product speaks one design language.
- **The brand is fixed.** The builder chrome and the marketing pages (`site/`) are MFDIY's branding. They always use MFDIY's own theme and never change when a user switches MFD themes. User themes reach only the MFD, so 0003's rule that a user's theme can never break the editor still holds.
- **Shared:** colour, typography, borders, radius, glow and motion. **Not shared:** spacing and sizing. MFD sizes scale with their cell (`cqmin`); the chrome uses rem/px and touch-sized targets (0001). The chrome's spacing and sizing tokens are private to `packages/ui`.
- **The spacing between widgets is a theme token** (`gap`), so users can control it like any other part of the look. Bonsai's spacing scale can't express it anyway: it scales with the display.
- **The safe zone is not a theme concern.** Insets for a screen mounted behind a frame or bezel belong to that screen, not to a look that's shared between screens (0002).

### Tiers

1. **Primitive**: the raw palette and scales.
2. **Semantic**: what something means (`text.dim`, `status.warning`). Each defaults to a primitive.
3. **Component**: one part of one MFD primitive (`button.face.pressed`). Each falls back to a semantic token, so it only needs setting to diverge.

- A theme may set values at **every tier**. The set of tokens is the contract's and is fixed: users can't add tokens.
- **Primitives are named by role, not by hue**: scales such as `neutral` and `primary`, never `green`. A theme recolours a scale without its name becoming wrong, e.g. Amber CRT is an amber `neutral` scale. Steps count contrast away from the background, so a light theme reverses a scale instead of renaming it.
- **Five colour scales of nine steps, `.1`–`.9`**: `neutral`, `primary`, `secondary`, `warning` (amber: needs attention soon) and `critical` (red: act now). Themes, ours included, will use far fewer steps; all nine are exposed so customisation stays consistent and flexible. Users rarely see token names, so `.1`–`.9` is preferred over `100`–`900`; nine steps are granular enough that inserting steps in between won't be needed.
- **Every step stays clearly distinct** from its neighbours. A scale of near-identical shades is pointless to choose from. Shipped themes keep visible gaps, and the theme editor's generator should too.
- **The contract only holds tokens something reads.** Adding a token later is not a breaking change, so tokens for features that don't exist yet (tap feedback, the guarded-button cover) arrive with those features, without a migration.
- **Colours are hex only**: `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`. Theme files hold literal values; there are no references between tokens.
- **Letter case is themable**: a theme can turn uppercase labels off (`label.case`), for accessibility. This adds a keyword token type that accepts only a fixed list of values.

### Interaction states belong to the chrome

- MFD widgets have **no hover or pressed state**. Actions fire on touch (0010), so there is nothing to show between press and release. Instead, a tap gets **tap feedback**: a ripple from the touch point and a soft, quick shockwave around the outside of the widget, so players know it registered. Its colours and timing are public tokens.
- The builder chrome still needs hover, pressed, focus, disabled, selected and destructive states, the editing overlay, spacing and control sizes. These are **private to `packages/ui`**, derived from the brand theme's primitives, and not part of the public contract.
- The brand theme is **dark only** and is called **`mfdiy`**, so it's clearly the project's own theme and not one of the MFD themes it ships. There are no light and dark colour schemes.

### How the chrome reads tokens

- **Same names, separate variables.** The builder interface uses the shared names under its own prefix, `--ui-*`, never `--mfd-*`, so a user's theme can't reach it, not even the editing controls drawn on top of an MFD.
- **Resolved at build time.** The `mfdiy` theme never changes, so each shared token is resolved once along its fallback chain (`resolveToken`) and the chrome gets plain values, with no `var()` chains.
- **Private chrome tokens** sit in the same namespace: interaction states (hover, pressed, focus, disabled), danger tints, the editing overlay (blue; the canvas ghost, overlap and dot colours), the spacing scale, the shared control height (44 px on touch screens), a 1 px hairline, and square corners.
- **Focus.** Buttons and links show a hairline ring 2 px outside their border; fields show focus by brightening their border to white instead. Selected text inverts (white background, dark text), like the primary button.
- **Dialogs.** The title and actions stay in place and only the content between them scrolls; a hairline marks content that continues out of view. A dialog starts with focus on its first field, or on itself, never on a button, so Enter can't fire an action by accident. Only a `dismissible` dialog has a close button and closes on Escape or a press outside; the others are announced as alert dialogs and close through an action. The backdrop is darkened, never blurred, and so is the command palette's.
- **One control size.** Buttons, fields and every other control share one height, so they always line up: 32 px with a mouse, 44 px on touch screens (0001). Button has no `size` prop.
- **Variants.** Button: `default` (hairline outline), `primary` (solid inverted), `quiet` (no outline) and `danger` (critical). Text: `label` (uppercase, tracked), `body`, `value` and `heading`, setting typography only; colour is a separate prop. More only when a screen needs them.
- **Sprinkles** only multiply what's used: layout props respond to container widths, colour and interaction props to the pointer and element state, and type to nothing.

### Brand direction: Panel white

The builder chrome follows the **Phosphor console** direction in its **Panel white** colouring (explored in the canvas linked below):

- **Flat**: no elevation or shadows. Structure comes from hairlines and tone. This matches the MFDs, which are flat; Bonsai's chrome looked three-dimensional next to them.
- **No hue of its own**: warm white on near-black. Selection and the primary action invert to solid white with dark ink. Colour is reserved for meaning (caution, danger) and for the user's MFD, which becomes the most colourful thing on screen.
- **Mono, condensed type** (Martian Mono at 87.5 % width). Uppercase only for short labels and buttons; names, values, descriptions and headings in mixed case, for readability. Sizes: label 10.5 px, body 12 px, value 13 px, heading 15 px (bold). **No italics anywhere**: Martian Mono has none, so the reset sets `font-style: normal` on everything a browser italicises.
- **Editing controls on the canvas** (selection, handles) use a hue MFD themes are unlikely to use (blue), the same in every theme (0003).

## Why

- Most MFD tools, many of them coded quickly with AI, share one look: phosphor green, the same few fonts, generic sci-fi. MFDIY should look like an MFD without looking like all of them. The MFD feel comes from structure (mono type, hairlines, inversion, flatness); green is only the hue everyone defaults to.
- A colourless chrome never competes with or clashes with whatever theme a user picks.
- Sharing a vocabulary means one set of names to learn, document and build an editor for.
- Bonsai's ~200 tokens, each named after a component and variant, multiply through every Sprinkles condition. A few dozen semantic tokens shrink the builder's CSS and the type work that makes cold typechecks slow (CLAUDE.md, known tech debt).

## Consequences

- `packages/ui`'s light and dark colour schemes and its component tokens go away, replaced by the shared semantic tokens and the single `mfdiy` theme.
- The landing page moves from phosphor green to Panel white.
- **Fonts are bundled** (`packages/ui/src/fonts`), never left to the viewer's installed fonts, so an MFD looks the same on every screen. The bridge serves the app on the local network (0004), so fonts can't come from a CDN either. Themes, the brand's and MFD themes alike, pick from a **limited set of bundled fonts**, starting with Martian Mono (SIL OFL). A font token holds only the name of a bundled font, never a font stack, and the theme editor offers them in a picker (forked from Bonsai's `Select`, or `Combobox` if the list grows), never a text field.
- **`style` or `className` on `Box` or another Bonsai component is a code smell** in the apps and packages: it means Bonsai is missing something or a value is off-scale. Raise it rather than work around it. Allowed: MFD looks from `--mfd-*` tokens through `className` (0003), and values computed from the document (theme overrides, grid tracks, widget areas), which are wrapped in components (`LayoutGrid`, `LayoutArea`) so call sites don't carry them.
- The theme format gets a new schema version. Documents already store token overrides (document, page and widget), so the bump comes with a migration from the current names.
- **Status names change meaning.** In theme version 1, `warning` was red and `caution` amber. Now amber is `warning` and red is `critical`, chosen because "caution" and "warning" read as near-synonyms. The migration maps v1 `caution` → `warning` and v1 `warning` → `critical`.
- **Later, in the theme editor:** a user gives a colour spread of four or five swatches and MFDIY generates each scale, which they can then hand-edit step by step. When a swatch sits close to an edge (e.g. `#f1f1f1`, whose lighter steps would all clip to `#fff`), the editor flags it. Out of scope for now, but role-named scales are chosen with it in mind.

## Open questions

- **The token list**: the semantic and component tokens. Being drafted with the maintainer.
- Design exploration: <https://claude.ai/artifact/UqUb5mJXkwssEwP9WpBNbQ> (private to the maintainer).
