import type {
  IntrinsicProps as BoxIntrinsicProps,
  BoxProps,
  StyleProps as BoxStyleProps,
  CssVariablesProp
} from '../Box/Box.js';
import type { ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';

import { clsx } from 'clsx';
import {
  NavLink,
  type NavLinkProps as RouterNavLinkProps,
  type NavLinkRenderProps as RouterNavLinkRenderProps
} from 'react-router';

import { useRestProps } from '../../hooks/useRestProps/useRestProps.js';

export type IntrinsicProps = Omit<BoxIntrinsicProps<'a'>, 'className' | 'href'> &
  Pick<BoxProps<'a'>, 'viewTransitionName'> &
  PropsWithChildren;

export type LinkBaseProps = IntrinsicProps &
  Omit<RouterNavLinkProps, 'className' | 'color'> & {
    className?: ClassValue | ((props: RouterNavLinkRenderProps) => ClassValue | undefined);
    /**
     * Sets inline CSS Variables that are scoped to this link. Useful to pass information down to
     * nested components.
     */
    cssVariables?: CssVariablesProp | undefined;
  };

export function Link({
  children,
  color,
  cssVariables,
  className: classNameProp,
  ref,
  style: styleProp,
  textDecoration,
  to,
  viewTransitionName,
  ...restProps
}: LinkBaseProps & BoxStyleProps) {
  const { designSystemClassNames, nativeProps } = useRestProps(restProps, {
    styleProps: {
      color: color ?? 'text',
      textDecoration: textDecoration ?? 'none'
    }
  });

  const style =
    typeof styleProp === 'function'
      ? (renderProps: RouterNavLinkRenderProps) => ({ ...cssVariables, ...styleProp(renderProps), viewTransitionName })
      : ({ ...cssVariables, ...styleProp, viewTransitionName } as const);

  return (
    <NavLink
      {...nativeProps}
      className={renderProps => {
        const className = typeof classNameProp === 'function' ? classNameProp(renderProps) : classNameProp;
        return clsx(designSystemClassNames, className);
      }}
      ref={ref}
      style={style}
      to={to}
    >
      {children}
    </NavLink>
  );
}
