import { describe, expect, it } from 'vitest';

import { pageToken } from './pageToken.js';
import { amberCrt, phosphor } from './themes.js';

describe('pageToken', () => {
  it("is the defaults' value without any tokens", () => {
    expect(pageToken('accent', undefined, undefined)).toBe(phosphor['primary.8']);
  });

  it("takes the document's theme", () => {
    expect(pageToken('accent', amberCrt.tokens, undefined)).toBe(amberCrt.tokens['primary.8']);
  });

  it("takes the page's value over the document's", () => {
    expect(pageToken('accent', { accent: '#ff0000' }, { accent: '#00ff00' })).toBe('#00ff00');
  });

  it('follows the fallback chain as CSS does: a token set on the document beats a primitive set on the page', () => {
    expect(pageToken('accent', { accent: '#ff0000' }, { 'primary.8': '#00ff00' })).toBe('#ff0000');
  });
});
