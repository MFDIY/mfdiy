import type { Spacing } from './props/Spacing.js';
import type { ContainerSizeConditionalValue } from '../../styles/design-system.js';
import type { TagName } from '../Box/props/TagName.js';
import type { PropsWithChildren } from 'react';

import { Box, type BoxProps } from '../Box/Box.js';

import { useNegativeMargin } from './useNegativeMargin.js';

export { spacing } from './props/Spacing.js';
export { tagNames } from '../Box/props/TagName.js';

export type BleedProps<T extends TagName> = Omit<
  BoxProps<T>,
  | 'bottom'
  | 'left'
  | 'margin'
  | 'marginBlock'
  | 'marginBottom'
  | 'marginInline'
  | 'marginLeft'
  | 'marginRight'
  | 'marginTop'
  | 'right'
  | 'top'
> &
  PropsWithChildren<{
    /** Sets the bottom bleed amount. Trumps `vertical` and `uniform`. */
    bottom?: ContainerSizeConditionalValue<Spacing> | undefined;
    /** Sets the horizontal bleed amount. Trumps `uniform`. Trumped by `left` and `right`. */
    horizontal?: ContainerSizeConditionalValue<Spacing> | undefined;
    /** Sets the left bleed amount. Trumps `horizontal` and `uniform`. */
    left?: ContainerSizeConditionalValue<Spacing> | undefined;
    /** Sets the right bleed amount. Trumps `horizontal` and `uniform`. */
    right?: ContainerSizeConditionalValue<Spacing> | undefined;
    /** Sets the top bleed amount. Trumps `vertical` and `uniform`. */
    top?: ContainerSizeConditionalValue<Spacing> | undefined;
    /**
     * Sets the vertical bleed amount. Trumped by `bottom`, `horizontal`, `left`, `right`, `top` and
     * `vertical`.
     */
    uniform?: ContainerSizeConditionalValue<Spacing> | undefined;
    /** Sets the vertical bleed amount. Trumps `uniform`. Trumped by `bottom` and `top`. */
    vertical?: ContainerSizeConditionalValue<Spacing> | undefined;
  }>;

export function Bleed<T extends TagName = 'div'>({
  bottom,
  children,
  className,
  display = 'block',
  horizontal,
  left,
  right,
  top,
  uniform,
  vertical,
  ...restProps
}: BleedProps<T>) {
  const marginBottom = useNegativeMargin(bottom ?? vertical ?? uniform, 'marginBottom');
  const marginLeft = useNegativeMargin(left ?? horizontal ?? uniform, 'marginLeft');
  const marginRight = useNegativeMargin(right ?? horizontal ?? uniform, 'marginRight');
  const marginTop = useNegativeMargin(top ?? vertical ?? uniform, 'marginTop');

  return (
    <Box {...restProps} className={[marginBottom, marginLeft, marginRight, marginTop, className]} display={display}>
      {children}
    </Box>
  );
}
