import { resolveToken, type TokenName } from '@mfdiy/schema';

import { mfdiy } from './mfdiy.js';

/*
 * The builder interface's tokens (0022). Shared names (`surface`, `text.dim`, `status.critical`, …)
 * mean the same as in MFD themes and are resolved from the `mfdiy` theme along the same fallback
 * chains, once, at build time. The rest are private to the interface: interaction states, spacing,
 * sizes and the editing overlay. None of them can be changed by a user's theme.
 */

const shared = (name: TokenName): string => {
  const value = resolveToken(name, mfdiy);

  if (value === undefined) {
    throw new Error(`The mfdiy theme has no value for ${name}.`);
  }

  return value;
};

/** Appends an alpha channel to a `#rrggbb` colour. */
const alpha = (hex: string, amount: string) => `${hex}${amount}`;

/** Editing controls look the same on every MFD theme, so they stand out from any of them (0003). */
const EDIT = '#4db8ff';

export const chromeTokens = {
  /* Colours: shared meaning */
  surface: shared('surface'),
  text: shared('text'),
  'text.dim': shared('text.dim'),
  line: shared('line'),
  accent: shared('accent'),
  'accent.text': shared('accent.text'),
  'status.warning': shared('status.warning'),
  'status.critical': shared('status.critical'),
  'status.critical.text': shared('status.critical.text'),

  /* Colours: the interface only */
  'surface.raised': mfdiy['neutral.2'],
  backdrop: alpha(mfdiy['neutral.1'], 'cc'),
  'text.faint': mfdiy['neutral.6'],
  'line.strong': mfdiy['neutral.5'],
  'accent.hover': mfdiy['primary.9'],
  'accent.pressed': mfdiy['neutral.8'],
  hover: alpha(mfdiy['primary.8'], '14'),
  pressed: alpha(mfdiy['primary.8'], '33'),
  focus: mfdiy['primary.8'],
  'critical.hover': alpha(mfdiy['critical.8'], '1a'),
  'critical.pressed': alpha(mfdiy['critical.8'], '33'),

  /* Editing overlay on the canvas */
  'canvas.edit': EDIT,
  'canvas.ghost': alpha(EDIT, '40'),
  'canvas.overlap': mfdiy['critical.8'],
  'canvas.overlap.fill': alpha(mfdiy['critical.8'], '73'),
  'canvas.handle': '#ffffff',
  'canvas.dot': alpha(mfdiy['neutral.7'], '88'),
  'canvas.halo': '0 0 0 1px #000b',
  'canvas.selected': `0 0 0 2px ${EDIT}, 0 0 0 4px #000b`,

  /* Type */
  font: `"${mfdiy['font.text']}", ui-monospace, monospace`,
  'font.stretch': '87.5%',
  'font.size.label': '10.5px',
  'font.size.body': '12px',
  'font.size.value': '13px',
  'font.size.heading': '15px',
  'font.weight.regular': '400',
  'font.weight.bold': '600',
  'tracking.label': mfdiy['label.tracking'],
  'line-height.body': '1.5',
  'line-height.heading': '1.2',

  /* Spacing and sizes */
  'spacing.1x': '3px',
  'spacing.2x': '5px',
  'spacing.3x': '8px',
  'spacing.4x': '13px',
  'spacing.5x': '21px',
  'spacing.6x': '34px',
  'spacing.7x': '55px',
  'spacing.8x': '89px',
  'spacing.none': '0px',
  /** The one height every control shares (buttons, fields, …), so they always line up (0022). */
  'size.control': '32px',
  'size.canvas.handle': '24px',
  /** A side panel beside the canvas, such as the widget library (0008). */
  'size.panel': '280px',
  'border.hairline': mfdiy['border.width'],
  'border.edit': '2px',
  'focus.width': '1px',
  'focus.offset': '2px',

  /* Motion */
  'duration.click': '60ms',
  'duration.short': mfdiy['duration'],
  'duration.long': '300ms'
} as const;

export type ChromeTokenName = keyof typeof chromeTokens;

/** On touch screens every control is at least a fingertip in size (0001). */
export const coarsePointerTokens = {
  'size.control': '44px',
  'size.canvas.handle': '44px'
} as const satisfies Partial<Record<ChromeTokenName, string>>;
