import { Box } from '@mfdiy/ui/components';

import * as styles from './Bar.css.js';
import { Frame } from './Frame.js';
import { Label } from './Label.js';

export const barStates = ['normal', 'warning', 'critical'] as const;

export type BarState = (typeof barStates)[number];

export type BarProps = {
  label: string;
  /** Fill level from 0 to 1, or `null` when there is no value. */
  value: number | null;
  /** Text shown above the bar, e.g. `74%`. */
  displayValue: string;
  state: BarState;
};

/** A linear gauge. */
export function Bar({ label, value, displayValue, state }: BarProps) {
  const level = value === null ? 0 : Math.min(1, Math.max(0, value));

  return (
    <Frame className={styles.bar} data-state={state} display='grid'>
      <Label>{label}</Label>
      <Box className={styles.value}>{displayValue}</Box>
      <Box
        alignSelf='flex-end'
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(level * 100)}
        className={styles.track}
        overflow='hidden'
        role='meter'
      >
        <Box
          className={styles.fill}
          height='full'
          style={{ transform: `scaleX(${level})` }}
          transformOrigin='left center'
        />
      </Box>
    </Frame>
  );
}
