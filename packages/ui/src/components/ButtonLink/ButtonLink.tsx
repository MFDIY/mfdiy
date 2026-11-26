import type { Variant } from '../Button/props/Variant.js';

import { variantStyles } from '../Button/variantStyles.js';
import { Link, type LinkBaseProps } from '../Link/Link.js';
import { Text } from '../Text/Text.js';

export type ButtonLinkProps = LinkBaseProps & {
  /** Sets the button variant. */
  variant?: Variant | undefined;
};

/** Looks like a large `Button`, but goes to another page. */
export function ButtonLink({ children, variant = 'default', ...restProps }: ButtonLinkProps) {
  return (
    <Link
      {...restProps}
      {...variantStyles[variant]}
      alignItems='center'
      borderStyle='solid'
      borderWidth='hairline'
      display='inline-flex'
      height='control.large'
      outlineColor='focus'
      outlineOffset='focus'
      outlineStyle={{ default: 'none', focusVisible: 'solid' }}
      outlineWidth='focus'
      paddingInline='4x'
      transitionDuration={{ default: 'short', active: 'click' }}
      transitionProperty='button-surface'
      transitionTimingFunction='ease-out'
    >
      <Text tagName='span' variant='label' whiteSpace='nowrap'>
        {children}
      </Text>
    </Link>
  );
}
