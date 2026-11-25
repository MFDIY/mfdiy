import type { ButtonStatus } from './Button.js';

import { clsx } from 'clsx';

import * as styles from './Light.css.js';
import { pressHandlers } from './pressHandlers.js';
import { cell, frame } from './shared.css.js';

export const lightStates = ['off', 'on', 'caution', 'warning'] as const;

export type LightState = (typeof lightStates)[number];

export type LightProps = {
  label: string;
  state: LightState;
  /** Makes the light pressable, like a lit push-button in a cockpit. */
  onPress?: (() => void) | undefined;
  status?: ButtonStatus | undefined;
  disabled?: boolean | undefined;
};

/** An annunciator light, optionally pressable. */
export function Light({ label, state, onPress, status = 'idle', disabled = false }: LightProps) {
  if (onPress) {
    return (
      <div className={cell}>
        <button
          className={clsx(frame, styles.light, styles.pressable)}
          data-state={state}
          data-status={status}
          disabled={disabled}
          {...pressHandlers(onPress, disabled)}
          type='button'
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <div className={cell}>
      <div className={clsx(frame, styles.light)} data-state={state} role='status'>
        {label}
      </div>
    </div>
  );
}
