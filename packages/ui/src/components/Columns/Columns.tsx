import type { Order } from './props/Order.js';
import type { TagName } from './props/TagName.js';
import type { ContainerSizeCondition, DesignSystem } from '../../styles/design-system.js';

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
  /** Controls the `row-gap` value when this component is collapsed. */
  collapsedSpacing?: DesignSystem['rowGap'] | undefined;
  /** Stacks the contents when this component's container becomes narrower than the given breakpoint. */
  collapseBelow?: Exclude<ContainerSizeCondition, 'default'> | undefined;
  /**
   * Adds dividers between all columns. These dividers are affected by `spacing` and
   * `collapsedSpacing`.
   */
  dividers?: boolean | undefined;
  /** Controls the `column-gap` value. */
  spacing?: DesignSystem['columnGap'] | undefined;
};

type IntrinsicProps<T extends TagName> = BoxIntrinsicProps<T>;

export type ColumnsProps<T extends TagName> = IntrinsicProps<T> &
  StyleProps &
  PropsWithChildren<{
    /** Controls the order of the rows when this component is collapsed. */
    collapsedOrder?: Order | undefined;
    /** Configures a name for container queries on this element. */
    containerName?: ContainerNameProp | undefined;
    /**
     * Sets inline CSS Variables that are scoped to this `Columns`. Useful to pass information down
     * to nested components.
     */
    cssVariables?: CssVariablesProp | undefined;
    /** Controls the order of the columns. */
    order?: Order | undefined;
    /** The semantic HTML element used to represent this `Columns` component. */
    tagName?: T | undefined;
    /** Configures a name for view transitions on this element. */
    viewTransitionName?: ViewTransitionNameProp | undefined;
  }>;

export function Columns<T extends TagName = 'div'>({
  children,
  className,
  collapseBelow,
  dividers = false,
  minHeight,
  order = 'normal',
  ref,
  spacing: columnGap,
  collapsedOrder = order,
  collapsedSpacing: rowGap = columnGap,
  tagName,
  ...restProps
}: ColumnsProps<T>) {
  const { designSystemClassNames, nativeProps } = useRestProps(restProps, {
    styleProps: { minHeight: minHeight ?? 'none' }
  });

  const isCollapsible = typeof collapseBelow !== 'undefined';
  const flexDirection = order === 'reversed' ? 'row-reverse' : 'row';
  const collapsedFlexDirection = collapsedOrder === 'reversed' ? 'column-reverse' : 'column';

  return (
    <Box
      {...nativeProps}
      className={[designSystemClassNames, className]}
      columnGap={columnGap}
      display='flex'
      flexDirection={
        isCollapsible ? { default: collapsedFlexDirection, [collapseBelow]: flexDirection } : flexDirection
      }
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
