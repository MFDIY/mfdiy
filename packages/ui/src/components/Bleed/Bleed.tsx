import type { PropsWithChildren } from 'react';

import { spacing } from '../../styles/properties.js';
import { Box } from '../Box/Box.js';

import * as styles from './Bleed.css.js';

export const bleedSpacings = Object.keys(spacing) as (keyof typeof spacing)[];

export type BleedSpacing = (typeof bleedSpacings)[number];

export type BleedProps = PropsWithChildren<{
  /** Sets the bottom bleed amount. Trumps `vertical` and `uniform`. */
  bottom?: BleedSpacing | undefined;
  /** Sets the horizontal bleed amount. Trumps `uniform`. Trumped by `left` and `right`. */
  horizontal?: BleedSpacing | undefined;
  /** Sets the left bleed amount. Trumps `horizontal` and `uniform`. */
  left?: BleedSpacing | undefined;
  /** Sets the right bleed amount. Trumps `horizontal` and `uniform`. */
  right?: BleedSpacing | undefined;
  /** Sets the top bleed amount. Trumps `vertical` and `uniform`. */
  top?: BleedSpacing | undefined;
  /** Sets the bleed amount on every side. Trumped by `bottom`, `horizontal`, `left`, `right`, `top` and `vertical`. */
  uniform?: BleedSpacing | undefined;
  /** Sets the vertical bleed amount. Trumps `uniform`. Trumped by `bottom` and `top`. */
  vertical?: BleedSpacing | undefined;
}>;

/**
 * Lets its content reach out over the padding of what it's in, e.g. an accordion's rows to the edges
 * of a `Group`'s frame. Give it the padding it's in; what's inside pads its own content back in, as
 * list rows and accordion rows do, so text stays where it was.
 */
export function Bleed({ bottom, children, horizontal, left, right, top, uniform, vertical }: BleedProps) {
  const marginBottom = styles.bottom[bottom ?? vertical ?? uniform ?? 'none'];
  const marginLeft = styles.left[left ?? horizontal ?? uniform ?? 'none'];
  const marginRight = styles.right[right ?? horizontal ?? uniform ?? 'none'];
  const marginTop = styles.top[top ?? vertical ?? uniform ?? 'none'];

  return <Box className={[marginBottom, marginLeft, marginRight, marginTop]}>{children}</Box>;
}
