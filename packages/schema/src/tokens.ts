import * as v from 'valibot';

/**
 * The MFD theme tokens: MFDIY's public theming API (see docs/decisions/0002 and 0003).
 *
 * Shared themes depend on these names. Renaming or removing a token is a breaking change that
 * requires a `THEME_SCHEMA_VERSION` bump and a migration.
 *
 * Tiers:
 * - `base`: the only tokens with default values. A simple theme sets just these.
 * - `semantic`: meaning-based; unset by default and resolved to `fallback` in styles.
 * - `component`: per-primitive; unset by default and resolved to `fallback` in styles.
 *
 * Semantic and component tokens deliberately have no default value. If they were defined on the
 * MFD root as `var(--base)`, the browser would resolve them on the root, and overriding a base token
 * on one widget wouldn't reach them. Resolving the fallback chain at the point of use keeps every
 * level of override working.
 */
export const THEME_SCHEMA_VERSION = 1;

export const tokenTypes = ['color', 'length', 'number', 'font-family', 'duration'] as const;

export type TokenType = (typeof tokenTypes)[number];

type TokenSpec =
  | { tier: 'base'; type: TokenType; description: string }
  | { tier: 'semantic' | 'component'; type: TokenType; fallback: string; description: string };

export const tokens = {
  /* ---------------- Base ---------------- */
  'color.background': { tier: 'base', type: 'color', description: 'Screen background.' },
  'color.foreground': { tier: 'base', type: 'color', description: 'Primary text and symbology.' },
  'color.dim': { tier: 'base', type: 'color', description: 'Secondary text, outlines and inactive elements.' },
  'color.primary': { tier: 'base', type: 'color', description: 'Accent for active and nominal states.' },
  'color.off': { tier: 'base', type: 'color', description: 'Inactive lights and empty tracks.' },
  'color.caution': { tier: 'base', type: 'color', description: 'Caution (amber) state.' },
  'color.warning': { tier: 'base', type: 'color', description: 'Warning (red) state.' },
  'font.family': { tier: 'base', type: 'font-family', description: 'Font for all MFD text.' },
  'size.radius': { tier: 'base', type: 'length', description: 'Corner radius of frames and lights.' },
  'size.border': { tier: 'base', type: 'length', description: 'Width of outlines.' },
  'size.glow': { tier: 'base', type: 'length', description: 'Blur radius of the phosphor glow. 0 disables it.' },
  'motion.duration': { tier: 'base', type: 'duration', description: 'Duration of value and state transitions.' },

  /* ---------------- Semantic ---------------- */
  surface: { tier: 'semantic', type: 'color', fallback: 'color.background', description: 'Widget surfaces.' },
  text: { tier: 'semantic', type: 'color', fallback: 'color.foreground', description: 'Text.' },
  'text.dim': { tier: 'semantic', type: 'color', fallback: 'color.dim', description: 'Labels and secondary text.' },
  outline: { tier: 'semantic', type: 'color', fallback: 'color.dim', description: 'Widget outlines.' },
  'state.on': { tier: 'semantic', type: 'color', fallback: 'color.primary', description: 'Active / nominal.' },
  'state.off': { tier: 'semantic', type: 'color', fallback: 'color.off', description: 'Inactive.' },
  'state.caution': { tier: 'semantic', type: 'color', fallback: 'color.caution', description: 'Caution.' },
  'state.warning': { tier: 'semantic', type: 'color', fallback: 'color.warning', description: 'Warning.' },

  /* ---------------- Component ---------------- */
  'light.on': { tier: 'component', type: 'color', fallback: 'state.on', description: 'Light: on.' },
  'light.off': { tier: 'component', type: 'color', fallback: 'state.off', description: 'Light: off.' },
  'light.text': { tier: 'component', type: 'color', fallback: 'surface', description: 'Light: label when lit.' },
  'bar.fill': { tier: 'component', type: 'color', fallback: 'state.on', description: 'Bar: fill.' },
  'bar.track': { tier: 'component', type: 'color', fallback: 'state.off', description: 'Bar: empty track.' },
  'readout.value': { tier: 'component', type: 'color', fallback: 'text', description: 'Readout: value.' },
  'readout.label': { tier: 'component', type: 'color', fallback: 'text.dim', description: 'Readout: label.' },
  'button.background': { tier: 'component', type: 'color', fallback: 'surface', description: 'Button: face.' },
  'button.text': { tier: 'component', type: 'color', fallback: 'text', description: 'Button: label.' },
  'button.outline': { tier: 'component', type: 'color', fallback: 'outline', description: 'Button: outline.' }
} as const satisfies Record<string, TokenSpec>;

export type TokenName = keyof typeof tokens;

export const tokenNames = Object.keys(tokens) as TokenName[];

export type BaseTokenName = {
  [K in TokenName]: (typeof tokens)[K]['tier'] extends 'base' ? K : never;
}[TokenName];

/** Kebab-case CSS custom property name without the leading dashes, e.g. `mfd-state-on`. */
export function toCssVariableName(token: TokenName): string {
  return `mfd-${token.replaceAll('.', '-')}`;
}

/* ---------------- Value validation ---------------- */

/**
 * Shared themes are untrusted input. Values end up in CSS custom properties, so anything that could
 * load a resource (`url()`, `image-set()`), escape the declaration (`;`, braces), smuggle comments or
 * escapes, or reference other variables is rejected outright before type-specific checks.
 */
const UNSAFE_VALUE = /url\(|image\(|image-set\(|src\(|var\(|env\(|attr\(|expression\(|[;{}<>\\@]|\/\*|\*\//i;

const NUMBER = String.raw`-?(?:\d+\.?\d*|\.\d+)`;

const COLOR_PATTERNS = [
  /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
  /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\([\d\s.,%/+-]+\)$/i,
  /^[a-z]+$/i
];

const LENGTH_PATTERN = new RegExp(`^(?:0|${NUMBER}(?:px|rem|em|%|vmin|vmax|vw|vh|cqmin|cqmax|cqi|cqb))$`, 'i');

const NUMBER_PATTERN = new RegExp(`^${NUMBER}$`);

const DURATION_PATTERN = new RegExp(`^${NUMBER}(?:ms|s)$`, 'i');

const FONT_FAMILY_PATTERN = /^[\w\s,"'-]+$/;

const valueValidators: Record<TokenType, (value: string) => boolean> = {
  color: value => COLOR_PATTERNS.some(pattern => pattern.test(value)),
  length: value => LENGTH_PATTERN.test(value),
  number: value => NUMBER_PATTERN.test(value),
  'font-family': value => FONT_FAMILY_PATTERN.test(value),
  duration: value => DURATION_PATTERN.test(value)
};

export function isValidTokenValue(token: TokenName, value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.length > 200 || UNSAFE_VALUE.test(trimmed)) {
    return false;
  }

  return valueValidators[tokens[token].type](trimmed);
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
