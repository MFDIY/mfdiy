import type { Variant } from './props/Variant.js';
import type { Width } from './props/Width.js';
import type { ContainerSizeConditionalValue, DesignSystem } from '../../styles/design-system.js';
import type { IntrinsicProps as BoxIntrinsicProps } from '../Box/Box.js';
import type { PropsWithChildren } from 'react';

import { ButtonBase } from './ButtonBase.js';
import { variantStyles } from './variantStyles.js';

export { variants } from './props/Variant.js';
export { widths } from './props/Width.js';

export const supportedStyleProps = [
  'justifyContent',
  'flexBasis',
  'flexGrow',
  'flexShrink'
] as const satisfies (keyof DesignSystem)[];

type SupportedStyleProp = (typeof supportedStyleProps)[number];

type StyleProps = Pick<DesignSystem, SupportedStyleProp>;

export type ButtonProps = BoxIntrinsicProps<'button'> &
  StyleProps &
  PropsWithChildren<{
    /** Sets the button variant. */
    variant?: Variant | undefined;
    /** Sets the button width. */
    width?: ContainerSizeConditionalValue<Width> | undefined;
  }>;

export function Button({ children, disabled = false, variant = 'default', ...restProps }: ButtonProps) {
  return (
    <ButtonBase {...restProps} {...variantStyles[variant]} disabled={disabled}>
      {children}
    </ButtonBase>
  );
}
