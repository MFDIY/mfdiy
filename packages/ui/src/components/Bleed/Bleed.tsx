import type { ReactNode } from 'react';

import { spacing } from '../../styles/properties.js';
import { Box } from '../Box/Box.js';

import * as styles from './Bleed.css.js';

export const bleedSpacings = Object.keys(spacing) as (keyof typeof spacing)[];

export type BleedSpacing = (typeof bleedSpacings)[number];

export type BleedProps = {
  /** How far it reaches past the padding below it. */
  bottom?: BleedSpacing | undefined;
  children: ReactNode;
  /** How far it reaches past the padding on either side. */
  horizontal?: BleedSpacing | undefined;
  /** How far it reaches past the padding above it. */
  top?: BleedSpacing | undefined;
};

/**
 * Lets its content reach out over the padding of what it's in, e.g. an accordion's rows to the edges
 * of a `Group`'s frame. Give it the padding it's in; what's inside pads its own content back in, as
 * list rows and accordion rows do, so text stays where it was.
 */
export function Bleed({ bottom, children, horizontal, top }: BleedProps) {
  return (
    <Box
      className={[
        bottom ? styles.bottom[bottom] : undefined,
        horizontal ? styles.horizontal[horizontal] : undefined,
        top ? styles.top[top] : undefined
      ]}
    >
      {children}
    </Box>
  );
}
