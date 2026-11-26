import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { ThemeSchema, isValidTokenValue, toCssVariableName, token, tokenNames, tokens } from './tokens.js';

describe('isValidTokenValue', () => {
  it.each([
    ['primary.8', '#59ff9c'],
    ['primary.8', '#5f9'],
    ['primary.8', '#59ff9c80'],
    ['primary.8', '#5f98'],
    ['radius', '4px'],
    ['radius', '0'],
    ['glow', '1.5cqmin'],
    ['duration', '200ms'],
    ['font.text', 'Martian Mono'],
    ['label.case', 'uppercase'],
    ['label.case', 'none']
  ] as const)('accepts %s = %s', (token, value) => {
    expect(isValidTokenValue(token, value)).toBe(true);
  });

  it.each([
    ['primary.8', 'url(https://example.com/track.png)'],
    ['primary.8', 'red; background: url(x)'],
    ['primary.8', 'var(--secret)'],
    ['primary.8', '#59ff9c /* */'],
    ['primary.8', '12px'],
    // Hex only (0022).
    ['primary.8', 'oklch(0.85 0.2 150)'],
    ['primary.8', 'rgb(89 255 156 / 50%)'],
    ['primary.8', 'black'],
    ['primary.8', '#59ff9'],
    ['radius', 'red'],
    ['radius', 'calc(1px + 2px)'],
    ['font.text', 'Arial} body { display: none'],
    // Only bundled fonts, by name (0022).
    ['font.text', '"Share Tech Mono", ui-monospace, monospace'],
    ['font.text', 'martian mono'],
    ['duration', '200'],
    ['label.case', 'lowercase'],
    ['label.case', 'UPPERCASE'],
    ['primary.8', '']
  ] as const)('rejects %s = %s', (token, value) => {
    expect(isValidTokenValue(token, value)).toBe(false);
  });
});

describe('ThemeSchema', () => {
  it('rejects unknown tokens', () => {
    const result = v.safeParse(ThemeSchema, { schema: 2, name: 'Bad', tokens: { 'not.a.token': '#fff' } });

    expect(result.success).toBe(false);
  });

  it('accepts a partial theme', () => {
    const result = v.safeParse(ThemeSchema, { schema: 2, name: 'Amber', tokens: { 'primary.8': '#ffb547' } });

    expect(result.success).toBe(true);
  });

  it('rejects an older version, which needs migrating first', () => {
    const result = v.safeParse(ThemeSchema, { schema: 1, name: 'Old', tokens: {} });

    expect(result.success).toBe(false);
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

  it('only falls back to tokens of the same type', () => {
    for (const name of tokenNames) {
      const spec = tokens[name];

      if ('fallback' in spec) {
        expect(tokens[spec.fallback as keyof typeof tokens].type, name).toBe(spec.type);
      }
    }
  });

  it('has nine steps for each of the five scales', () => {
    expect(tokenNames.filter(name => /^\w+\.[1-9]$/.test(name))).toHaveLength(45);
  });

  it('produces prefixed CSS variable names', () => {
    expect(toCssVariableName('status.on')).toBe('mfd-status-on');
  });
});

describe('token', () => {
  it('resolves the whole fallback chain where it is used', () => {
    expect(token('light.on')).toBe('var(--mfd-light-on, var(--mfd-status-on, var(--mfd-primary-8)))');
  });

  it('reads a primitive directly', () => {
    expect(token('radius')).toBe('var(--mfd-radius)');
  });
});
