import type { TagName } from './props/TagName.js';
import type { Variant } from './props/Variant.js';
import type { DesignSystem } from '../../styles/design-system.js';
import type { PropsWithChildren, Ref } from 'react';

import { useRestProps } from '../../hooks/useRestProps/useRestProps.js';
import {
  mapContainerSizeAndMediaAndPseudoConditionalValue,
  normalizeContainerSizeAndMediaAndPseudoConditionalValue,
  type ContainerSizeAndMediaAndPseudoConditionalValue
} from '../../styles/sprinkles.css.js';
import { Box, type IntrinsicProps as BoxIntrinsicProps, type BoxProps } from '../Box/Box.js';

import * as styles from './Text.css.js';
import * as variantMaps from './variantMaps.js';

export { tagNames } from './props/TagName.js';
export { variants } from './props/Variant.js';

export const supportedStyleProps = ['color', 'whiteSpace', 'wordBreak'] as const satisfies (keyof DesignSystem)[];

type SupportedStyleProp = (typeof supportedStyleProps)[number];

type StyleProps = Pick<DesignSystem, SupportedStyleProp> & {
  /** Sets a predefined typographic style. */
  variant?: ContainerSizeAndMediaAndPseudoConditionalValue<Variant> | undefined;
};

type IntrinsicProps<T extends TagName> = BoxIntrinsicProps<T>;

export type TextProps<T extends TagName> = IntrinsicProps<T> &
  Pick<BoxProps<T>, 'containerName' | 'viewTransitionName'> &
  StyleProps &
  PropsWithChildren<{
    /** The semantic HTML element used to represent this `Text` component. */
    tagName?: T | undefined;
    /** Truncates overflowing text with an ellipsis. */
    truncate?: boolean | undefined;
    /** Sets a forwarded `ref`. */
    ref?: Ref<HTMLElement> | undefined;
  }>;

/** `panel.header`/`table.header` uppercase their text; not itself conditionable per breakpoint. */
function hasUppercaseVariant(variant: ContainerSizeAndMediaAndPseudoConditionalValue<Variant>) {
  const resolvedVariants = Object.values(normalizeContainerSizeAndMediaAndPseudoConditionalValue(variant));
  return resolvedVariants.some(name => name in variantMaps.textTransform);
}

export function Text<T extends TagName = 'span'>({
  children,
  className,
  ref,
  tagName,
  truncate = false,
  variant,
  ...restProps
}: TextProps<T>) {
  const { designSystemClassNames, nativeProps } = useRestProps(restProps);

  const content = truncate ? (
    <Box className={styles.truncate} tagName='span'>
      {children}
    </Box>
  ) : (
    children
  );

  return (
    <Box
      {...nativeProps}
      className={[
        designSystemClassNames,
        styles.root,
        variant && hasUppercaseVariant(variant) ? styles.uppercase : undefined,
        className
      ]}
      fontFamily={variant ? undefined : 'inherit'}
      fontSize={
        variant ? mapContainerSizeAndMediaAndPseudoConditionalValue(variant, v => variantMaps.fontSize[v]) : 'inherit'
      }
      fontWeight={
        variant ? mapContainerSizeAndMediaAndPseudoConditionalValue(variant, v => variantMaps.fontWeight[v]) : 'inherit'
      }
      letterSpacing={
        variant
          ? mapContainerSizeAndMediaAndPseudoConditionalValue(variant, v => variantMaps.letterSpacing[v])
          : 'inherit'
      }
      lineHeight={
        variant ? mapContainerSizeAndMediaAndPseudoConditionalValue(variant, v => variantMaps.lineHeight[v]) : 'inherit'
      }
      ref={ref}
      tagName={(tagName as TagName | undefined) ?? 'span'}
    >
      {content}
    </Box>
  );
}
