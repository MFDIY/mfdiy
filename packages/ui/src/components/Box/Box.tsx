import type { TagName } from './props/TagName.js';
import type { DesignSystem } from '../../styles/design-system.js';

import { clsx, type ClassValue } from 'clsx';
import { createElement, type AllHTMLAttributes, type PropsWithChildren, type Ref } from 'react';

import { useRestProps } from '../../hooks/useRestProps/useRestProps.js';

export { tagNames } from './props/TagName.js';

export const excludedIntrinsicProps = [
  /** HTML attributes that have overlap with CSS properties and need to be redefined. */
  'className',
  'color',
  'height',
  'width'
] as const;

type ExcludedIntrinsicProp = (typeof excludedIntrinsicProps)[number];

export type BoxElement<T extends TagName> = T extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[T]
  : T extends keyof SVGElementTagNameMap
    ? SVGElementTagNameMap[T]
    : never;

export type IntrinsicProps<T extends TagName> = Omit<React.JSX.IntrinsicElements[T], ExcludedIntrinsicProp> & {
  /** ⚠️ Escape hatch! Avoid using this.** Sets a custom CSS class. */
  className?: ClassValue | undefined;
  /**
   * **⚠️ Escape hatch! Avoid using this.** Sets a native `height` attribute. Useful when using
   * `'img'` or `'svg'` as the `tagName` value.
   */
  htmlHeight?: AllHTMLAttributes<T>['height'];
  /**
   * **⚠️ Escape hatch! Avoid using this.** Sets a native `width` attribute. Useful when using
   * `'img'` or `'svg'` as the `tagName` value.
   */
  htmlWidth?: AllHTMLAttributes<T>['width'];
  /** Sets a forwarded `ref`. */
  ref?: Ref<HTMLElement | SVGElement> | undefined;
};

export type StyleProps = DesignSystem;

export const layoutStyleProps = [
  'bottom',
  'contain',
  'containerType',
  'inset',
  'left',
  'listStyleType',
  'overflow',
  'overflowX',
  'overflowY',
  'pointerEvents',
  'position',
  'right',
  'top',
  'userSelect',
  'visibility',
  'zIndex'
] as const satisfies (keyof StyleProps)[];

export type ContainerNameProp = string | undefined;

export type CssVariablesProp = Record<`--${string}`, number | string>;

export type ViewTransitionNameProp = string | undefined;

export type BoxProps<T extends TagName> = IntrinsicProps<T> &
  StyleProps &
  PropsWithChildren<{
    /** Sets a colour available from the design system. */
    color?: DesignSystem['color'] | undefined;
    /** Configures a name for container queries on this element. */
    containerName?: ContainerNameProp | undefined;
    /**
     * Sets inline CSS Variables that are scoped to this `Box`. Useful to pass information down to
     * nested components.
     */
    cssVariables?: CssVariablesProp | undefined;
    /** The semantic HTML element used to represent this `Box` component. */
    tagName?: T | undefined;
    /** Configures a name for view transitions on this element. */
    viewTransitionName?: ViewTransitionNameProp | undefined;
  }>;

export function Box<T extends TagName = 'div'>({
  children,
  className,
  color,
  containerName,
  cssVariables,
  htmlHeight: height,
  htmlWidth: width,
  ref,
  style,
  tagName,
  viewTransitionName,
  ...restProps
}: BoxProps<T>) {
  const { designSystemClassNames, nativeProps } = useRestProps(restProps, {
    styleProps: { color },
    nativeProps: { height, width }
  });

  const combinedClassNames = clsx(designSystemClassNames, className);

  const element = createElement(
    tagName ?? 'div',
    /* eslint-disable-next-line react-hooks/refs -- https://github.com/facebook/react/issues/31357 */
    {
      ...nativeProps,
      className: combinedClassNames || undefined,
      ref,
      style: { ...cssVariables, ...style, containerName, viewTransitionName }
    },
    children
  );

  return element;
}
