import { Box } from '@mfdiy/ui/components';

import * as styles from './shared.css.js';

type NameProps = {
  children: string;
  className?: string | undefined;
};

/** The name of a value, cut off with an ellipsis when it doesn't fit. */
export function Name({ children, className }: NameProps) {
  return (
    <Box className={[styles.label, className]} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
      {children}
    </Box>
  );
}
