import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { MfdDocumentSchema } from './document.js';
import { migrateDocument, migrateTheme, migrateTokenValuesV1 } from './migrations.js';
import { ThemeSchema } from './tokens.js';

describe('migrateTokenValuesV1', () => {
  it('moves primitives to their scale steps', () => {
    expect(
      migrateTokenValuesV1({
        'color.background': '#050806',
        'color.foreground': '#b9ffd3',
        'color.primary': '#59ff9c',
        'color.off': '#0f2017',
        'size.radius': '0.5cqmin',
        'motion.duration': '250ms'
      })
    ).toEqual({
      'neutral.1': '#050806',
      'neutral.9': '#b9ffd3',
      'primary.8': '#59ff9c',
      'primary.2': '#0f2017',
      radius: '0.5cqmin',
      duration: '250ms'
    });
  });

  it('keeps amber amber and red red, though the names changed meaning', () => {
    expect(
      migrateTokenValuesV1({
        'color.caution': '#ffb547',
        'color.warning': '#ff5f4a',
        'state.caution': '#ffaa00',
        'state.warning': '#ff0000'
      })
    ).toEqual({
      'warning.8': '#ffb547',
      'critical.8': '#ff5f4a',
      'status.warning': '#ffaa00',
      'status.critical': '#ff0000'
    });
  });

  it('keeps outlines following the dim colour, unless the outline was set too', () => {
    expect(migrateTokenValuesV1({ 'color.dim': '#2a7a4b' })).toEqual({ 'neutral.7': '#2a7a4b', line: '#2a7a4b' });
    expect(migrateTokenValuesV1({ 'color.dim': '#2a7a4b', outline: '#111111' })).toEqual({
      'neutral.7': '#2a7a4b',
      line: '#111111'
    });
  });

  it('splits tokens that served several parts', () => {
    expect(migrateTokenValuesV1({ 'light.text': '#000000', 'readout.value': '#ffffff' })).toEqual({
      'light.on.text': '#000000',
      'light.warning.text': '#000000',
      'light.critical.text': '#000000',
      'readout.value': '#ffffff',
      'bar.value': '#ffffff'
    });
  });

  it('drops colours that are no longer allowed', () => {
    expect(migrateTokenValuesV1({ 'color.primary': 'oklch(0.85 0.2 150)', 'color.dim': 'teal' })).toEqual({});
  });
});

describe('migrateTheme', () => {
  it('produces a valid current theme', () => {
    const migrated = migrateTheme({ schema: 1, name: 'Amber CRT', tokens: { 'color.primary': '#ffb547' } });

    expect(v.parse(ThemeSchema, migrated)).toEqual({
      schema: 2,
      name: 'Amber CRT',
      tokens: { 'primary.8': '#ffb547' }
    });
  });

  it('leaves a current theme alone', () => {
    const theme = { schema: 2, name: 'Current', tokens: { 'primary.8': '#ffb547' } };

    expect(migrateTheme(theme)).toBe(theme);
  });
});

describe('migrateDocument', () => {
  const area = { column: 1, row: 1, columnSpan: 4, rowSpan: 2 };

  const version1 = {
    schema: 1,
    name: 'Old',
    game: 'star-citizen',
    tokens: { 'color.primary': '#5ad8ff' },
    pages: [
      {
        id: 'main',
        name: 'Main',
        tokens: { 'color.off': '#0a1c24' },
        widgets: [
          {
            id: 'decouple',
            type: 'light',
            options: { label: 'Decpl', litState: 'caution' },
            tokens: { 'light.on': '#ffffff' }
          },
          { id: 'hull', type: 'light', options: { litState: 'warning' } },
          { id: 'fuel', type: 'bar', options: { cautionBelow: 0.3, warningBelow: 0.1 } }
        ],
        layouts: [
          {
            orientation: 'any',
            grid: { columns: 8, rows: 6 },
            areas: { decouple: area, hull: { ...area, row: 3 }, fuel: { ...area, row: 5 } }
          }
        ]
      }
    ]
  };

  it('migrates tokens at every level, statuses and thresholds into a valid document', () => {
    const migrated = v.parse(MfdDocumentSchema, migrateDocument(version1));
    const [page] = migrated.pages;

    expect(migrated.schema).toBe(2);
    expect(migrated.tokens).toEqual({ 'primary.8': '#5ad8ff' });
    expect(page?.tokens).toEqual({ 'primary.2': '#0a1c24' });
    expect(page?.widgets).toEqual([
      {
        id: 'decouple',
        type: 'light',
        options: { label: 'Decpl', litState: 'warning' },
        tokens: { 'light.on': '#ffffff' }
      },
      { id: 'hull', type: 'light', options: { litState: 'critical' } },
      { id: 'fuel', type: 'bar', options: { warningBelow: 0.3, criticalBelow: 0.1 } }
    ]);
  });

  it('leaves a current document alone', () => {
    const current = { ...version1, schema: 2 };

    expect(migrateDocument(current)).toBe(current);
  });
});
