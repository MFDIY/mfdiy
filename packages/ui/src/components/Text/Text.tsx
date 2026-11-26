import type { TagName } from './props/TagName.js';
import type { Variant } from './props/Variant.js';
import type { DesignSystem } from '../../styles/design-system.js';
import type { PropsWithChildren, Ref } from 'react';

import { useRestProps } from '../../hooks/useRestProps/useRestProps.js';
import { Box, type IntrinsicProps as BoxIntrinsicProps, type BoxProps } from '../Box/Box.js';

import * as styles from './Text.css.js';

export { tagNames } from './props/TagName.js';
export { variants } from './props/Variant.js';

export const supportedStyleProps = ['color', 'whiteSpace', 'wordBreak'] as const satisfies (keyof DesignSystem)[];

type SupportedStyleProp = (typeof supportedStyleProps)[number];

type StyleProps = Pick<DesignSystem, SupportedStyleProp> & {
  /** Sets a typographic style; without one, the text inherits its parent's. */
  variant?: Variant | undefined;
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
      className={[designSystemClassNames, variant ? styles.variants[variant] : styles.root, className]}
      ref={ref}
      tagName={(tagName as TagName | undefined) ?? 'span'}
    >
      {content}
    </Box>
  );
}
