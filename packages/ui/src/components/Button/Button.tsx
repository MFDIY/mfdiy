import type { Size } from './props/Size.js';
import type { Variant } from './props/Variant.js';
import type { Width } from './props/Width.js';
import type {
  ContainerSizeAndMediaAndPseudoConditionalValue,
  ContainerSizeConditionalValue,
  DesignSystem
} from '../../styles/design-system.js';
import type { IntrinsicProps as BoxIntrinsicProps } from '../Box/Box.js';
import type { PropsWithChildren } from 'react';

import { ButtonBase } from './ButtonBase.js';

export { sizes } from './props/Size.js';
export { variants } from './props/Variant.js';
export { widths } from './props/Width.js';

export const supportedStyleProps = [
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
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
    /** Sets the button size. */
    size?: ContainerSizeAndMediaAndPseudoConditionalValue<Size> | undefined;
    /** Sets the button variant. */
    variant?: Variant | undefined;
    /** Sets the button width. */
    width?: ContainerSizeConditionalValue<Width> | undefined;
  }>;

export function Button({ children, disabled = false, variant = 'soft', ...restProps }: ButtonProps) {
  const variantMap = {
    default: `button.${variant}`,
    hover: `button.${variant}-hover`,
    active: `button.${variant}-active`,
    disabled: `button.${variant}-disabled`
  } as const;

  return (
    <ButtonBase
      {...restProps}
      backgroundColor={variantMap}
      boxShadow={variantMap}
      color={variantMap}
      disabled={disabled}
    >
      {children}
    </ButtonBase>
  );
}
