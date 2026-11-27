import { describe, expect, it } from 'vitest';

import { formatShape, parseShape, seedGrid } from './shape.js';

describe('parseShape', () => {
  it.each([
    ['16:10', { width: 16, height: 10 }],
    ['1920x1080', { width: 1920, height: 1080 }],
    ['1920 × 1080', { width: 1920, height: 1080 }],
    [' 9/19.5 ', { width: 9, height: 19.5 }],
    ['4,3:3', { width: 4.3, height: 3 }]
  ])('reads %s', (text, shape) => {
    expect(parseShape(text)).toEqual(shape);
  });

  it.each(['', '16', '16:0', 'wide', '16:10:2', '-16:10'])('rejects %j', text => {
    expect(parseShape(text)).toBeNull();
  });
});

describe('formatShape', () => {
  it('writes a ratio as typed', () => {
    expect(formatShape({ width: 1920, height: 1080 })).toBe('1920:1080');
    expect(formatShape({ width: 9, height: 19.5 })).toBe('9:19.5');
  });
});

describe('seedGrid', () => {
  it.each([
    [
      { width: 16, height: 10 },
      { columns: 24, rows: 15 }
    ],
    [
      { width: 3, height: 2 },
      { columns: 24, rows: 16 }
    ],
    [
      { width: 16, height: 9 },
      { columns: 24, rows: 14 }
    ],
    [
      { width: 9, height: 19.5 },
      { columns: 11, rows: 24 }
    ],
    [
      { width: 1, height: 1 },
      { columns: 24, rows: 24 }
    ]
  ])('seeds square-ish cells for %j', (shape, grid) => {
    expect(seedGrid(shape)).toEqual(grid);
  });
});
