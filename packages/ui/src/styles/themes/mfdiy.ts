import type { PrimitiveTokenName } from '@mfdiy/schema';

/**
 * `mfdiy`: the project's own theme, used by the builder interface and the marketing pages (0022).
 * It is the brand, so it never changes with the user's MFD theme. Dark only.
 *
 * Panel white: the interface has no hue of its own. Warm white on near-black, and selection and
 * the primary action invert to solid white. Colour is kept for meaning (warning, critical) and for
 * the user's MFD. Scales were generated in OKLCH from pinned colours so steps stay distinct.
 */
export const mfdiy: Record<PrimitiveTokenName, string> = {
  'neutral.1': '#0b0b0a',
  'neutral.2': '#151413',
  'neutral.3': '#1f1e1c',
  'neutral.4': '#2a2926',
  'neutral.5': '#4a4843',
  'neutral.6': '#716d65',
  'neutral.7': '#9a958a',
  'neutral.8': '#c9c4b8',
  'neutral.9': '#ece8de',

  // The neutral scale with a brighter top, so selection is the brightest thing in the interface.
  'primary.1': '#0b0b0a',
  'primary.2': '#151413',
  'primary.3': '#1f1e1c',
  'primary.4': '#2a2926',
  'primary.5': '#4a4843',
  'primary.6': '#716d65',
  'primary.7': '#9a958a',
  'primary.8': '#f2eee4',
  'primary.9': '#ffffff',

  // Magenta, the cockpit's route colour. Not used by the interface yet.
  'secondary.1': '#12020d',
  'secondary.2': '#22041b',
  'secondary.3': '#35092b',
  'secondary.4': '#4d1140',
  'secondary.5': '#701e5e',
  'secondary.6': '#9e2d85',
  'secondary.7': '#d741b6',
  'secondary.8': '#ff4fd8',
  'secondary.9': '#ffe1f5',

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
  'critical.9': '#ffd9d3',

  // Martian Mono isn't bundled yet; it arrives with the rebuilt interface.
  'font.text': '"Martian Mono", ui-monospace, monospace',
  'font.numeric': '"Martian Mono", ui-monospace, monospace',
  'label.case': 'uppercase',
  'label.tracking': '0.14em',
  radius: '0',
  'border.width': '1px',
  glow: '10px',
  duration: '150ms'
};
