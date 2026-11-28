import * as v from 'valibot';

/**
 * The theme tokens: MFDIY's public theming API and the vocabulary its own interface is built
 * from (see docs/decisions/0002, 0003 and 0022).
 *
 * Shared themes depend on these names. Renaming or removing a token is a breaking change that
 * requires a `THEME_SCHEMA_VERSION` bump and a migration (`migrations.ts`). Adding one is not, so the
 * contract only holds tokens something actually reads; new ones arrive with the feature that uses
 * them.
 *
 * Tiers:
 * - `primitive`: the palette and other raw values. The only tokens with default values.
 * - `semantic`: what something means; unset by default and resolved to `fallback` where used.
 * - `component`: one part of one MFD primitive; unset by default and resolved to `fallback`.
 *
 * Semantic and component tokens deliberately have no default value. If they were defined on the
 * MFD root as `var(--primitive)`, the browser would resolve them on the root, and overriding a
 * primitive on one widget wouldn't reach them. Resolving the fallback chain at the point of use
 * (`token()`) keeps every level of override working.
 */
export const THEME_SCHEMA_VERSION = 2;

export const tokenTypes = ['color', 'length', 'font', 'duration', 'keyword'] as const;

export type TokenType = (typeof tokenTypes)[number];

/* ---------------- Fonts ---------------- */

/**
 * The fonts a theme can pick from: bundled with MFDIY, so an MFD looks the same on every screen,
 * and declared in `packages/ui/src/styles/fonts.css.ts`. A theme names one; it never supplies its
 * own font stack (0022). The theme editor offers them in a picker, not a text field.
 */
export const bundledFonts = ['Martian Mono'] as const;

export type BundledFont = (typeof bundledFonts)[number];

/* ---------------- Colour scales ---------------- */

/** Named by role, never by hue, so a theme can recolour a scale without its name becoming wrong. */
export const scaleNames = ['neutral', 'primary', 'secondary', 'warning', 'critical'] as const;

export type ScaleName = (typeof scaleNames)[number];

/** Steps count contrast away from the background, so a light theme reverses a scale. */
export const scaleSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type ScaleStep = (typeof scaleSteps)[number];

export type ScaleTokenName = `${ScaleName}.${ScaleStep}`;

const scaleDescriptions: Record<ScaleName, string> = {
  neutral: 'Neutral: backgrounds, lines and text.',
  primary: 'Primary: the accent, and whatever is on.',
  secondary: 'Secondary: a second accent.',
  warning: 'Warning (amber): needs attention soon.',
  critical: 'Critical (red): act now.'
};

const stepRoles: Record<ScaleStep, string> = {
  1: 'background',
  2: 'raised surface, unlit fill',
  3: 'hover fill',
  4: 'hairline',
  5: 'strong line',
  6: 'faint text',
  7: 'dim text',
  8: 'solid: lit, selected, primary',
  9: 'brightest text'
};

type ScaleTokenSpec = { tier: 'primitive'; type: 'color'; description: string };

const scaleTokens = Object.fromEntries(
  scaleNames.flatMap(scale =>
    scaleSteps.map(step => [
      `${scale}.${step}`,
      { tier: 'primitive', type: 'color', description: `${scaleDescriptions[scale]} Step ${step}: ${stepRoles[step]}.` }
    ])
  )
) as Record<ScaleTokenName, ScaleTokenSpec>;

/* ---------------- The contract ---------------- */

type TokenSpec =
  | { tier: 'primitive'; type: TokenType; description: string; values?: readonly string[] }
  | { tier: 'semantic' | 'component'; type: TokenType; fallback: string; description: string };

export const tokens = {
  /* ---------------- Primitive ---------------- */
  ...scaleTokens,
  'font.text': { tier: 'primitive', type: 'font', values: bundledFonts, description: 'Font for labels and text.' },
  'font.numeric': { tier: 'primitive', type: 'font', values: bundledFonts, description: 'Font for values.' },
  'label.case': {
    tier: 'primitive',
    type: 'keyword',
    values: ['uppercase', 'none'],
    description: 'Letter case of labels: `uppercase`, or `none` to show them as typed.'
  },
  'label.tracking': { tier: 'primitive', type: 'length', description: 'Letter spacing of labels.' },
  gap: {
    tier: 'primitive',
    type: 'length',
    description: 'Space between widgets, and around them. Relative units (`cqmin`) scale it with the display.'
  },
  radius: { tier: 'primitive', type: 'length', description: 'Corner radius of frames and lights.' },
  'border.width': { tier: 'primitive', type: 'length', description: 'Width of outlines.' },
  'corner.width': {
    tier: 'primitive',
    type: 'length',
    description:
      'Thickness of the corners that mark a widget that can be pressed. Every widget keeps room for them, so they line up. 0 for none.'
  },
  'corner.gap': {
    tier: 'primitive',
    type: 'length',
    description: 'Space between the corners of a widget that can be pressed and the widget itself.'
  },
  glow: {
    tier: 'primitive',
    type: 'length',
    description: 'Blur radius of the glow around lit elements. 0 turns it off.'
  },
  duration: { tier: 'primitive', type: 'duration', description: 'Duration of value and state transitions.' },

  /* ---------------- Semantic ---------------- */
  surface: { tier: 'semantic', type: 'color', fallback: 'neutral.1', description: 'Widget surfaces.' },
  text: { tier: 'semantic', type: 'color', fallback: 'neutral.9', description: 'Text.' },
  'text.dim': { tier: 'semantic', type: 'color', fallback: 'neutral.7', description: 'Labels and secondary text.' },
  line: { tier: 'semantic', type: 'color', fallback: 'neutral.4', description: 'Outlines.' },
  accent: { tier: 'semantic', type: 'color', fallback: 'primary.8', description: 'Accent, e.g. the focus ring.' },
  'accent.text': { tier: 'semantic', type: 'color', fallback: 'neutral.1', description: 'Text on the accent.' },
  'status.on': { tier: 'semantic', type: 'color', fallback: 'primary.8', description: 'On, nominal.' },
  'status.on.text': { tier: 'semantic', type: 'color', fallback: 'accent.text', description: 'Text on "on".' },
  'status.off': { tier: 'semantic', type: 'color', fallback: 'primary.2', description: 'Off, inactive.' },
  'status.off.text': { tier: 'semantic', type: 'color', fallback: 'text.dim', description: 'Text on "off".' },
  'status.warning': { tier: 'semantic', type: 'color', fallback: 'warning.8', description: 'Warning.' },
  'status.warning.text': { tier: 'semantic', type: 'color', fallback: 'neutral.1', description: 'Text on warning.' },
  'status.critical': { tier: 'semantic', type: 'color', fallback: 'critical.8', description: 'Critical.' },
  'status.critical.text': { tier: 'semantic', type: 'color', fallback: 'neutral.1', description: 'Text on critical.' },

  /* ---------------- Component ---------------- */
  'light.on': { tier: 'component', type: 'color', fallback: 'status.on', description: 'Light: on.' },
  'light.on.text': {
    tier: 'component',
    type: 'color',
    fallback: 'status.on.text',
    description: 'Light: label when on.'
  },
  'light.off': { tier: 'component', type: 'color', fallback: 'status.off', description: 'Light: off.' },
  'light.off.text': {
    tier: 'component',
    type: 'color',
    fallback: 'status.off.text',
    description: 'Light: label when off.'
  },
  'light.warning': { tier: 'component', type: 'color', fallback: 'status.warning', description: 'Light: warning.' },
  'light.warning.text': {
    tier: 'component',
    type: 'color',
    fallback: 'status.warning.text',
    description: 'Light: label when warning.'
  },
  'light.critical': { tier: 'component', type: 'color', fallback: 'status.critical', description: 'Light: critical.' },
  'light.critical.text': {
    tier: 'component',
    type: 'color',
    fallback: 'status.critical.text',
    description: 'Light: label when critical.'
  },
  'bar.fill': { tier: 'component', type: 'color', fallback: 'status.on', description: 'Bar: fill.' },
  'bar.fill.warning': {
    tier: 'component',
    type: 'color',
    fallback: 'status.warning',
    description: 'Bar: fill, warning.'
  },
  'bar.fill.critical': {
    tier: 'component',
    type: 'color',
    fallback: 'status.critical',
    description: 'Bar: fill, critical.'
  },
  'bar.track': { tier: 'component', type: 'color', fallback: 'status.off', description: 'Bar: empty track.' },
  'bar.value': { tier: 'component', type: 'color', fallback: 'text', description: 'Bar: value.' },
  'readout.value': { tier: 'component', type: 'color', fallback: 'text', description: 'Readout: value.' },
  'readout.unit': { tier: 'component', type: 'color', fallback: 'text.dim', description: 'Readout: unit.' },
  'readout.label': { tier: 'component', type: 'color', fallback: 'text.dim', description: 'Readout: label.' },
  'readout.zeros': {
    tier: 'component',
    type: 'color',
    fallback: 'neutral.5',
    description: 'Readout: leading zeros, dimmer than the digits that count.'
  },
  'press.cue': {
    tier: 'component',
    type: 'color',
    fallback: 'text.dim',
    description: 'Pressable widgets: the corners that show they can be pressed.'
  },
  'press.accepted': {
    tier: 'component',
    type: 'color',
    fallback: 'status.on',
    description: 'Pressable widgets: the corners once the game accepted the press.'
  },
  'press.pending': {
    tier: 'component',
    type: 'color',
    fallback: 'accent',
    description: 'Pressable widgets: waiting for the game to answer.'
  },
  'press.failed': {
    tier: 'component',
    type: 'color',
    fallback: 'status.critical',
    description: 'Pressable widgets: the game refused the press.'
  }
} as const satisfies Record<string, TokenSpec>;

export type TokenName = keyof typeof tokens;

export const tokenNames = Object.keys(tokens) as TokenName[];

export type PrimitiveTokenName = {
  [K in TokenName]: (typeof tokens)[K]['tier'] extends 'primitive' ? K : never;
}[TokenName];

/** Kebab-case CSS custom property name without the leading dashes, e.g. `mfd-status-on`. */
export function toCssVariableName(token: TokenName): string {
  return `mfd-${token.replaceAll('.', '-')}`;
}

function fallbackChain(name: TokenName): TokenName[] {
  const spec: TokenSpec = tokens[name];

  return 'fallback' in spec ? [name, ...fallbackChain(spec.fallback as TokenName)] : [name];
}

/**
 * Returns a CSS value for a token that resolves its whole fallback chain at the point of use,
 * e.g. `token('light.on')` → `var(--mfd-light-on, var(--mfd-status-on, var(--mfd-primary-8)))`.
 *
 * Always use this in styles instead of naming the variables directly, so overrides at any level
 * (document, page, widget) and any tier take effect.
 */
export function token(name: TokenName): string {
  return fallbackChain(name).reduceRight(
    (inner, link) => `var(--${toCssVariableName(link)}${inner ? `, ${inner}` : ''})`,
    ''
  );
}

/**
 * The value a token ends up with in a theme: its own, or the first one set along its fallback
 * chain. For themes that never change at runtime, such as the brand's (`mfdiy`), so their tokens
 * can be resolved once at build time.
 */
export function resolveToken(name: TokenName, values: Partial<Record<TokenName, string>>): string | undefined {
  return fallbackChain(name)
    .map(link => values[link])
    .find(value => value !== undefined);
}

export type FontTokenName = {
  [K in TokenName]: (typeof tokens)[K]['type'] extends 'font' ? K : never;
}[TokenName];

/**
 * A font token as a CSS `font-family`, with a generic fallback for the moment before the bundled
 * font has loaded. Use this instead of `token()` for fonts.
 */
export function fontFamily(name: FontTokenName): string {
  return `${token(name)}, ui-monospace, monospace`;
}

/* ---------------- Value validation ---------------- */

/**
 * Shared themes are untrusted input. Values end up in CSS custom properties, so anything that could
 * load a resource (`url()`, `image-set()`), escape the declaration (`;`, braces), smuggle comments or
 * escapes, or reference other variables is rejected outright before type-specific checks.
 */
const UNSAFE_VALUE = /url\(|image\(|image-set\(|src\(|var\(|env\(|attr\(|expression\(|[;{}<>\\@]|\/\*|\*\//i;

const NUMBER = String.raw`-?(?:\d+\.?\d*|\.\d+)`;

/** Hex only (0022): `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`. */
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const LENGTH_PATTERN = new RegExp(`^(?:0|${NUMBER}(?:px|rem|em|%|vmin|vmax|vw|vh|cqmin|cqmax|cqi|cqb))$`, 'i');

const DURATION_PATTERN = new RegExp(`^${NUMBER}(?:ms|s)$`, 'i');

export function isValidTokenValue(token: TokenName, value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.length > 200 || UNSAFE_VALUE.test(trimmed)) {
    return false;
  }

  const spec: TokenSpec = tokens[token];

  switch (spec.type) {
    case 'color':
      return HEX_COLOR_PATTERN.test(trimmed);
    case 'length':
      return LENGTH_PATTERN.test(trimmed);
    case 'duration':
      return DURATION_PATTERN.test(trimmed);
    case 'font':
    case 'keyword':
      return 'values' in spec && spec.values !== undefined && spec.values.includes(trimmed);
  }
}

export const TokenValuesSchema = v.pipe(
  v.record(v.picklist(tokenNames), v.string()),
  v.check(
    values => Object.entries(values).every(([token, value]) => isValidTokenValue(token as TokenName, value)),
    'Theme contains an invalid or unsafe token value.'
  )
);

export type TokenValues = Partial<Record<TokenName, string>>;

export const ThemeSchema = v.object({
  schema: v.literal(THEME_SCHEMA_VERSION),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  author: v.optional(v.pipe(v.string(), v.maxLength(64))),
  tokens: TokenValuesSchema
});

export type Theme = v.InferOutput<typeof ThemeSchema>;
