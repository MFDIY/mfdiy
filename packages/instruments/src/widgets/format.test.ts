import { describe, expect, it } from 'vitest';

import { formatNumber } from './format.js';

const en = (value: number, options: { decimals?: number; digits?: number } = {}) =>
  formatNumber(value, { ...options, locale: 'en' });

describe('formatNumber', () => {
  it('has no leading zeros unless asked', () => {
    expect(en(212)).toEqual({ digits: '212', sign: '', value: 212, zeros: '' });
  });

  it('pads with zeros to the digits asked for, apart from the digits that count', () => {
    expect(en(212, { digits: 3 })).toMatchObject({ digits: '212', zeros: '' });
    expect(en(42, { digits: 3 })).toMatchObject({ digits: '42', zeros: '0' });
    expect(en(7, { digits: 3 })).toMatchObject({ digits: '7', zeros: '00' });
  });

  it('keeps the last whole digit of zero as one that counts', () => {
    expect(en(0, { digits: 4 })).toMatchObject({ digits: '0', zeros: '0,00' });
    expect(en(0.5, { decimals: 1, digits: 2 })).toMatchObject({ digits: '0.5', zeros: '0' });
  });

  it('keeps group separators inside the zeros with them', () => {
    expect(en(999, { digits: 5 })).toMatchObject({ digits: '999', zeros: '00,' });
    expect(en(1234, { digits: 6 })).toMatchObject({ digits: '1,234', zeros: '00' });
  });

  it('puts the sign before the zeros', () => {
    expect(en(-12, { digits: 3 })).toEqual({ digits: '12', sign: '-', value: -12, zeros: '0' });
  });

  it('never pads past what the value already has', () => {
    expect(en(12345, { digits: 2 })).toMatchObject({ digits: '12,345', zeros: '' });
  });
});
