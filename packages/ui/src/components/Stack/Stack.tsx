import type { Order } from './props/Order.js';
import type { TagName } from './props/TagName.js';
import type { DesignSystem } from '../../styles/design-system.js';

import { Children, isValidElement, type PropsWithChildren } from 'react';

import { useRestProps } from '../../hooks/useRestProps/useRestProps.js';
import {
  Box,
  layoutStyleProps,
  type IntrinsicProps as BoxIntrinsicProps,
  type ContainerNameProp,
  type CssVariablesProp,
  type ViewTransitionNameProp
} from '../Box/Box.js';
import { Divider } from '../Divider/Divider.js';

export { order } from './props/Order.js';
export { tagNames } from './props/TagName.js';

export const supportedStyleProps = [
  ...layoutStyleProps,
  'alignItems',
  'alignSelf',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'height',
  'justifyContent',
  'minHeight',
  'minWidth'
] as const satisfies (keyof DesignSystem)[];

type SupportedStyleProp = (typeof supportedStyleProps)[number];

type StyleProps = Pick<DesignSystem, SupportedStyleProp> & {
  /** Adds dividers between all rows. These dividers are affected by `spacing`. */
  dividers?: boolean | undefined;
  /** Controls the `row-gap` value. */
  spacing?: DesignSystem['rowGap'] | undefined;
};

type IntrinsicProps<T extends TagName> = BoxIntrinsicProps<T>;

export type StackProps<T extends TagName> = IntrinsicProps<T> &
  StyleProps &
  PropsWithChildren<{
    /** Configures a name for container queries on this element. */
    containerName?: ContainerNameProp | undefined;
    /**
     * Sets inline CSS Variables that are scoped to this `Stack`. Useful to pass information down to
     * nested components.
     */
    cssVariables?: CssVariablesProp | undefined;
    /** Controls the order of the rows. */
    order?: Order | undefined;
    /** The semantic HTML element used to represent this `Stack` component. */
    tagName?: T | undefined;
    /** Configures a name for view transitions on this element. */
    viewTransitionName?: ViewTransitionNameProp | undefined;
  }>;

export function Stack<T extends TagName = 'div'>({
  children,
  className,
  dividers = false,
  minHeight,
  order = 'normal',
  ref,
  spacing: rowGap,
  tagName,
  ...restProps
}: StackProps<T>) {
  const { designSystemClassNames, nativeProps } = useRestProps(restProps, {
    styleProps: { minHeight: minHeight ?? 'none' }
  });

  return (
    <Box
      {...nativeProps}
      className={[designSystemClassNames, className]}
      display='flex'
      flexDirection={order === 'reversed' ? 'column-reverse' : 'column'}
      flexWrap='nowrap'
      ref={ref}
      rowGap={rowGap}
      tagName={(tagName as TagName | undefined) ?? 'div'}
    >
      {dividers
        ? Children.map(children, (child, index) =>
            index === 0 ? (
              child
            ) : isValidElement(child) ? (
              <>
                <Divider />
                {child}
              </>
            ) : null
          )?.filter(Boolean)
        : children}
    </Box>
  );
}
