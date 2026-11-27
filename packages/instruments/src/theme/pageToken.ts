import { resolveToken, type TokenName, type TokenValues } from '@mfdiy/schema';

import { phosphor } from './themes.js';

/**
 * What a token comes to on a page, as its MFD shows it: each variable takes the page's value, else
 * the document's, else the default every MFD starts from, and the token then follows its fallback
 * chain through them, as `token()` does in CSS. For the builder's chrome, which shows a page's
 * colour outside the MFD, e.g. the logomark taking its accent.
 */
export function pageToken(
  name: TokenName,
  documentTokens: TokenValues | undefined,
  pageTokens: TokenValues | undefined
): string | undefined {
  return resolveToken(name, { ...phosphor, ...definedValues(documentTokens), ...definedValues(pageTokens) });
}

function definedValues(values: TokenValues | undefined): Partial<Record<TokenName, string>> {
  return Object.fromEntries(Object.entries(values ?? {}).filter(([, value]) => value !== undefined));
}
