import { tokens, toCssVariableName, type TokenName } from '@mfdiy/schema';

function fallbackChain(name: TokenName): TokenName[] {
  const spec = tokens[name];

  return 'fallback' in spec ? [name, ...fallbackChain(spec.fallback)] : [name];
}

/**
 * Returns a CSS value for a token that resolves its whole fallback chain at the point of use,
 * e.g. `token('light.on')` → `var(--mfd-light-on, var(--mfd-state-on, var(--mfd-color-primary)))`.
 *
 * Always use this in styles instead of reading `vars` directly, so overrides at any level (document,
 * page, widget) and any tier (base, semantic, component) take effect. See `tokens.ts` in
 * `@mfdiy/schema` for why semantic and component tokens have no default values.
 */
export function token(name: TokenName): string {
  return fallbackChain(name).reduceRight(
    (inner, link) => `var(--${toCssVariableName(link)}${inner ? `, ${inner}` : ''})`,
    ''
  );
}
