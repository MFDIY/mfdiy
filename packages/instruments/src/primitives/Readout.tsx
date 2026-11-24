import { clsx } from 'clsx';

import * as styles from './Readout.css.js';
import { cell, frame, label as labelStyle } from './shared.css.js';

export type ReadoutProps = {
  label: string;
  value: string;
  unit?: string | undefined;
};

/** A labelled value, e.g. speed or aUEC balance. */
export function Readout({ label, value, unit }: ReadoutProps) {
  return (
    <div className={cell}>
      <div className={clsx(frame, styles.readout)}>
        <div className={clsx(labelStyle, styles.label)}>{label}</div>
        <div className={styles.value}>
          {value}
          {unit ? <span className={styles.unit}>{unit}</span> : null}
        </div>
      </div>
    </div>
  );
}
