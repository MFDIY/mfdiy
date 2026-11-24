import { clsx } from 'clsx';

import * as styles from './Bar.css.js';
import { cell, frame, label as labelStyle } from './shared.css.js';

export const barStates = ['normal', 'caution', 'warning'] as const;

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
    <div className={cell}>
      <div className={clsx(frame, styles.bar)} data-state={state}>
        <div className={labelStyle}>{label}</div>
        <div className={styles.value}>{displayValue}</div>
        <div
          aria-label={label}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(level * 100)}
          className={styles.track}
          role='meter'
        >
          <div className={styles.fill} style={{ transform: `scaleX(${level})` }} />
        </div>
      </div>
    </div>
  );
}
