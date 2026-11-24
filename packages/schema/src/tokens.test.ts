import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { ThemeSchema, isValidTokenValue, toCssVariableName, tokenNames, tokens } from './tokens.js';

describe('isValidTokenValue', () => {
  it.each([
    ['color.primary', '#59ff9c'],
    ['color.primary', 'oklch(0.85 0.2 150)'],
    ['color.primary', 'rgb(89 255 156 / 50%)'],
    ['color.primary', 'black'],
    ['size.radius', '4px'],
    ['size.radius', '0'],
    ['size.glow', '1.5cqmin'],
    ['motion.duration', '200ms'],
    ['font.family', '"Share Tech Mono", ui-monospace, monospace']
  ] as const)('accepts %s = %s', (token, value) => {
    expect(isValidTokenValue(token, value)).toBe(true);
  });

  it.each([
    ['color.primary', 'url(https://example.com/track.png)'],
    ['color.primary', 'red; background: url(x)'],
    ['color.primary', 'var(--secret)'],
    ['color.primary', '#59ff9c /* */'],
    ['color.primary', '12px'],
    ['size.radius', 'red'],
    ['size.radius', 'calc(1px + 2px)'],
    ['font.family', 'Arial} body { display: none'],
    ['motion.duration', '200'],
    ['color.primary', '']
  ] as const)('rejects %s = %s', (token, value) => {
    expect(isValidTokenValue(token, value)).toBe(false);
  });
});

describe('ThemeSchema', () => {
  it('rejects unknown tokens', () => {
    const result = v.safeParse(ThemeSchema, { schema: 1, name: 'Bad', tokens: { 'not.a.token': '#fff' } });

    expect(result.success).toBe(false);
  });

  it('accepts a partial theme', () => {
    const result = v.safeParse(ThemeSchema, { schema: 1, name: 'Amber', tokens: { 'color.primary': '#ffb547' } });

    expect(result.success).toBe(true);
  });
});

describe('tokens', () => {
  it('only falls back to tokens that exist', () => {
    for (const name of tokenNames) {
      const spec = tokens[name];

      if ('fallback' in spec) {
        expect(tokenNames).toContain(spec.fallback);
      }
    }
  });

  it('produces prefixed CSS variable names', () => {
    expect(toCssVariableName('state.on')).toBe('mfd-state-on');
  });
});
