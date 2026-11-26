import { isValidTokenValue, type TokenName, type TokenValues } from '@mfdiy/schema';
import { assignInlineVars } from '@vanilla-extract/dynamic';

import { vars } from './contract.css.js';

/**
 * Turns theme token values into inline CSS variables for a document, page or widget element: pass
 * the result to `Box`'s `cssVariables`. Invalid or unsafe values are dropped as a last line of
 * defence; themes should already have been validated with `ThemeSchema` when they were loaded.
 */
export function applyTokens(values: TokenValues | undefined): Record<`--${string}`, string> {
  if (!values) {
    return {};
  }

  const assignments: Record<string, string> = {};

  for (const [name, value] of Object.entries(values)) {
    if (value !== undefined && isValidTokenValue(name as TokenName, value)) {
      assignments[vars[name as TokenName]] = value;
    }
  }

  return assignInlineVars(assignments) as Record<`--${string}`, string>;
}
