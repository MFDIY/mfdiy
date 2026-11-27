import { Box } from '@mfdiy/ui/components';

import { Frame } from './Frame.js';
import { Label } from './Label.js';
import * as styles from './Readout.css.js';

export const readoutStates = ['normal', 'warning', 'critical'] as const;

export type ReadoutState = (typeof readoutStates)[number];

export type ReadoutProps = {
  label: string;
  state?: ReadoutState | undefined;
  unit?: string | undefined;
  value: string;
};

/** A labelled value, e.g. speed or aUEC balance. */
export function Readout({ label, state = 'normal', unit, value }: ReadoutProps) {
  return (
    <Frame className={styles.readout} data-state={state} display='flex' flexDirection='column' justifyContent='center'>
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
