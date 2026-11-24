import { tokenNames, toCssVariableName, type TokenName } from '@mfdiy/schema';
import { createGlobalThemeContract } from '@vanilla-extract/css';

/**
 * The public `--mfd-*` CSS custom properties, generated from the token list in `@mfdiy/schema`.
 * Names are stable (not hashed) because shared themes depend on them.
 */
export const vars = createGlobalThemeContract(
  Object.fromEntries(tokenNames.map(name => [name, toCssVariableName(name)])) as Record<TokenName, string>
);
