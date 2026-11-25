import type { Size } from './props/Size.js';
import type { DesignSystem } from '../../styles/design-system.js';

export const paddingBlock = {
  large: '4x',
  small: '2x',
  standard: '3x'
} as const satisfies Record<Size, DesignSystem['paddingBlock']>;

export const paddingInline = {
  large: '4x',
  small: '2x',
  standard: '3x'
} as const satisfies Record<Size, DesignSystem['paddingInline']>;
