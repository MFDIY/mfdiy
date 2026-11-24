import { clsx } from 'clsx';

import * as styles from './Button.css.js';
import { cell, frame } from './shared.css.js';

export const buttonStatuses = ['idle', 'pending', 'ok', 'failed'] as const;

export type ButtonStatus = (typeof buttonStatuses)[number];

export type ButtonProps = {
  label: string;
  /** Feedback from the last press, so users can see whether the game accepted it. */
  status: ButtonStatus;
  disabled?: boolean | undefined;
  onPress: () => void;
};

/** A touch-friendly button that triggers an action. */
export function Button({ label, status, disabled = false, onPress }: ButtonProps) {
  return (
    <div className={cell}>
      <button
        className={clsx(frame, styles.button)}
        data-status={status}
        disabled={disabled}
        onClick={onPress}
        type='button'
      >
        {label}
      </button>
    </div>
  );
}
