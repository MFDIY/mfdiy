import { Link, type LinkBaseProps } from '../Link/Link.js';

export type TextLinkProps = LinkBaseProps;

export function TextLink({ children, ...restProps }: TextLinkProps) {
  return (
    <Link
      {...restProps}
      backgroundImage='link'
      backgroundPosition='left bottom'
      backgroundRepeat='no-repeat'
      backgroundSize={{ default: 'link-hover', 'can-hover': 'link', hover: 'link-hover' }}
      color={{ default: 'link', hover: 'link-hover' }}
      fontWeight='link'
      position='relative'
      textDecoration='none'
      transitionDuration={{ default: 'long', hover: 'short' }}
      transitionProperty='link'
      transitionTimingFunction='ease-out'
    >
      {children}
    </Link>
  );
}
