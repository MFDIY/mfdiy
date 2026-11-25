import type { Variant } from '../Button/props/Variant.js';

import { Link, type LinkBaseProps } from '../Link/Link.js';
import { Text } from '../Text/Text.js';

export type ButtonLinkProps = LinkBaseProps & {
  /** Sets the button variant. */
  variant?: Variant | undefined;
};

/** Looks like a large `Button`, but goes to another page. */
export function ButtonLink({ children, variant = 'soft', ...restProps }: ButtonLinkProps) {
  const variantMap = {
    default: `button.${variant}`,
    hover: `button.${variant}-hover`,
    active: `button.${variant}-active`
  } as const;

  return (
    <Link
      {...restProps}
      alignItems='center'
      backgroundColor={variantMap}
      borderRadius='2x'
      boxShadow={variantMap}
      color={variantMap}
      display='inline-flex'
      fontSize='button.large'
      height='button.large'
      outlineColor='focus-ring'
      outlineStyle={{ default: 'none', focusVisible: 'solid' }}
      outlineWidth='focus-ring'
      paddingInline='4x'
      transitionDuration={{ default: 'short', active: 'click' }}
      transitionProperty='button-surface'
      transitionTimingFunction='ease-out'
    >
      <Text tagName='span' variant='button.large' whiteSpace='nowrap'>
        {children}
      </Text>
    </Link>
  );
}
