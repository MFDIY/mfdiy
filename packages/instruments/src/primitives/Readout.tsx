import { Box } from '@mfdiy/ui/components';

import { Frame } from './Frame.js';
import { Label } from './Label.js';
import * as styles from './Readout.css.js';

export type ReadoutProps = {
  label: string;
  value: string;
  unit?: string | undefined;
};

/** A labelled value, e.g. speed or aUEC balance. */
export function Readout({ label, value, unit }: ReadoutProps) {
  return (
    <Frame className={styles.readout} display='flex' flexDirection='column' justifyContent='center'>
      <Label className={styles.label}>{label}</Label>
      <Box className={styles.value} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
        {value}
        {unit ? (
          <Box className={styles.unit} tagName='span'>
            {unit}
          </Box>
        ) : null}
      </Box>
    </Frame>
  );
}
