import type { Size } from './props/Size.js';
import type { DesignSystem } from '../../styles/design-system.js';

export const height = {
  large: 'control.large',
  small: 'control.small',
  standard: 'control'
} as const satisfies Record<Size, DesignSystem['height']>;

export const paddingInline = {
  large: '4x',
  small: '2x',
  standard: '3x'
} as const satisfies Record<Size, DesignSystem['paddingInline']>;
