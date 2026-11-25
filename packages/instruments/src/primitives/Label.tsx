import { Box } from '@mfdiy/ui/components';

import * as styles from './shared.css.js';

type LabelProps = {
  children: string;
  className?: string | undefined;
};

/** The name of a value, cut off with an ellipsis when it doesn't fit. */
export function Label({ children, className }: LabelProps) {
  return (
    <Box className={[styles.label, className]} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
      {children}
    </Box>
  );
}
