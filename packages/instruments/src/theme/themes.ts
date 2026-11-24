import type { BaseTokenName, Theme } from '@mfdiy/schema';

/** Default values for every base token. Semantic and component tokens are never given defaults. */
export type BaseTokenValues = Record<BaseTokenName, string>;

export const phosphor: BaseTokenValues = {
  'color.background': '#050806',
  'color.foreground': '#b9ffd3',
  'color.dim': '#2a7a4b',
  'color.primary': '#59ff9c',
  'color.off': '#0f2017',
  'color.caution': '#ffb547',
  'color.warning': '#ff5f4a',
  'font.family': 'ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace',
  'size.radius': '0.5cqmin',
  'size.border': '1px',
  'size.glow': '1.5cqmin',
  'motion.duration': '250ms'
};

/** A built-in theme showing how few tokens a full restyle needs. */
export const amberCrt: Theme = {
  schema: 1,
  name: 'Amber CRT',
  tokens: {
    'color.background': '#0d0802',
    'color.foreground': '#ffd9a0',
    'color.dim': '#7a4f12',
    'color.primary': '#ffb547',
    'color.off': '#24180a',
    'color.caution': '#ffe066',
    'color.warning': '#ff5f4a'
  }
};

export const builtInThemes: Theme[] = [{ schema: 1, name: 'Phosphor', tokens: phosphor }, amberCrt];
