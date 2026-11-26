import { Link, type LinkBaseProps } from '../Link/Link.js';

export type TextLinkProps = LinkBaseProps;

export function TextLink({ children, ...restProps }: TextLinkProps) {
  return (
    <Link
      {...restProps}
      color={{ default: 'text', hover: 'accent', active: 'accent' }}
      outlineColor='focus'
      outlineOffset='focus'
      outlineStyle={{ default: 'none', focusVisible: 'solid' }}
      outlineWidth='focus'
      textDecoration='underline'
      transitionDuration='short'
      transitionProperty='colors'
      transitionTimingFunction='ease-out'
    >
      {children}
    </Link>
  );
}
