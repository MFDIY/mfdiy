import { Box } from '../Box/Box.js';

import * as styles from './Logomark.css.js';

export type LogomarkProps = {
  /**
   * A colour to take instead of the brand's, e.g. the accent of the MFD page being edited. Changes
   * fade from one colour to the next.
   */
  color?: string | undefined;
};

/**
 * MFDIY's name as a logomark. The one part of the Panel white chrome (0022) that may take a colour:
 * the accent of what's being built.
 */
export function Logomark({ color }: LogomarkProps) {
  return (
    <Box className={styles.root} cssVariables={color ? { [styles.colorProperty]: color } : undefined} tagName='span'>
      MFDIY
    </Box>
  );
}
