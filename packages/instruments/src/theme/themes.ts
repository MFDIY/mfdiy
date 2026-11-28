import { THEME_SCHEMA_VERSION, type PrimitiveTokenName, type Theme } from '@mfdiy/schema';

/** A value for every primitive token: what an MFD falls back to. Semantic and component tokens have none. */
export type PrimitiveTokenValues = Record<PrimitiveTokenName, string>;

/*
 * Scales were generated in OKLCH from a few pinned colours (the version 1 palette), so neighbouring
 * steps stay clearly distinct. Theme values are visual placeholders until the redesign.
 */

export const phosphor: PrimitiveTokenValues = {
  'neutral.1': '#050806',
  'neutral.2': '#0b180f',
  'neutral.3': '#122a1a',
  'neutral.4': '#183c26',
  'neutral.5': '#1e5032',
  'neutral.6': '#24653e',
  'neutral.7': '#2a7a4b',
  'neutral.8': '#72bb8d',
  'neutral.9': '#b9ffd3',

  'primary.1': '#030905',
  'primary.2': '#0f2017',
  'primary.3': '#19402c',
  'primary.4': '#246242',
  'primary.5': '#2e8758',
  'primary.6': '#3bad6f',
  'primary.7': '#49d685',
  'primary.8': '#59ff9c',
  'primary.9': '#bafece',

  'secondary.1': '#01090d',
  'secondary.2': '#03141a',
  'secondary.3': '#08222a',
  'secondary.4': '#0f333e',
  'secondary.5': '#1b4c5b',
  'secondary.6': '#296d81',
  'secondary.7': '#3c96b1',
  'secondary.8': '#5ad8ff',
  'secondary.9': '#d0f2fe',

  'warning.1': '#0d0601',
  'warning.2': '#1a0f02',
  'warning.3': '#2a1b05',
  'warning.4': '#3e290a',
  'warning.5': '#5c3e13',
  'warning.6': '#825a1f',
  'warning.7': '#b27d2f',
  'warning.8': '#ffb547',
  'warning.9': '#fee7cc',

  'critical.1': '#130301',
  'critical.2': '#240704',
  'critical.3': '#380e09',
  'critical.4': '#511811',
  'critical.5': '#75271d',
  'critical.6': '#a53b2d',
  'critical.7': '#e15340',
  'critical.8': '#ff5f4a',
  'critical.9': '#ffe4df',

  'font.text': 'Martian Mono',
  'font.numeric': 'Martian Mono',
  'label.case': 'uppercase',
  'label.tracking': '0.12em',
  gap: '1.5cqmin',
  radius: '0.5cqmin',
  'border.width': '1px',
  'corner.width': '2px',
  'corner.gap': '0px',
  glow: '1.5cqmin',
  duration: '250ms'
};

/** A built-in theme: recolours three scales and leaves everything else to the defaults. */
export const amberCrt: Theme = {
  schema: THEME_SCHEMA_VERSION,
  name: 'Amber CRT',
  tokens: {
    'neutral.1': '#0d0802',
    'neutral.2': '#1c1303',
    'neutral.3': '#2d1e05',
    'neutral.4': '#3e2a07',
    'neutral.5': '#51360a',
    'neutral.6': '#65420e',
    'neutral.7': '#7a4f12',
    'neutral.8': '#bb915a',
    'neutral.9': '#ffd9a0',

    'primary.1': '#0c0602',
    'primary.2': '#24180a',
    'primary.3': '#442e14',
    'primary.4': '#66461e',
    'primary.5': '#8a6028',
    'primary.6': '#b07b33',
    'primary.7': '#d7983d',
    'primary.8': '#ffb547',
    'primary.9': '#fee7cc',

    'warning.1': '#0a0701',
    'warning.2': '#151103',
    'warning.3': '#241e08',
    'warning.4': '#352d0f',
    'warning.5': '#4f451a',
    'warning.6': '#716329',
    'warning.7': '#9c883b',
    'warning.8': '#ffe066',
    'warning.9': '#fff6d6'
  }
};

export const builtInThemes: Theme[] = [{ schema: THEME_SCHEMA_VERSION, name: 'Phosphor', tokens: phosphor }, amberCrt];
