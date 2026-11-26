import type { Variant } from './props/Variant.js';
import type { DesignSystem } from '../../styles/design-system.js';

type VariantStyle = Pick<DesignSystem, 'backgroundColor' | 'borderColor' | 'color'>;

/** How each button variant looks in each state. Shared by `Button` and `ButtonLink`. */
export const variantStyles = {
  /** A hairline outline: most actions. */
  default: {
    backgroundColor: { default: 'transparent', hover: 'hover', active: 'pressed', disabled: 'transparent' },
    borderColor: { default: 'line.strong', hover: 'accent', active: 'accent', disabled: 'line' },
    color: { default: 'text', disabled: 'text.faint' }
  },
  /** Solid and inverted: the one action a screen is for, like Save. */
  primary: {
    backgroundColor: { default: 'accent', hover: 'accent.hover', active: 'accent.pressed', disabled: 'surface.raised' },
    borderColor: { default: 'accent', hover: 'accent.hover', active: 'accent.pressed', disabled: 'line' },
    color: { default: 'accent.text', disabled: 'text.faint' }
  },
  /** No outline, for toolbars and buttons inside other controls. */
  quiet: {
    backgroundColor: { default: 'transparent', hover: 'hover', active: 'pressed', disabled: 'transparent' },
    borderColor: 'transparent',
    color: { default: 'text', disabled: 'text.faint' }
  },
  /** Destructive actions, like Delete. */
  danger: {
    backgroundColor: {
      default: 'transparent',
      hover: 'critical.hover',
      active: 'critical.pressed',
      disabled: 'transparent'
    },
    borderColor: { default: 'status.critical', disabled: 'line' },
    color: { default: 'status.critical', disabled: 'text.faint' }
  }
} as const satisfies Record<Variant, VariantStyle>;
