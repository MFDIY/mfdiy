import type { ButtonStatus } from './Button.js';

import { Frame } from './Frame.js';
import * as styles from './Light.css.js';
import { pressHandlers } from './pressHandlers.js';

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
      <Frame
        {...pressHandlers(onPress, disabled)}
        alignItems='center'
        appearance='none'
        className={[styles.light, styles.pressable]}
        cursor={{ default: 'pointer', disabled: 'not-allowed' }}
        data-state={state}
        data-status={status}
        disabled={disabled}
        display='flex'
        justifyContent='center'
        overflow='hidden'
        tagName='button'
        touchAction='none'
        type='button'
        userSelect='none'
        whiteSpace='nowrap'
      >
        {label}
      </Frame>
    );
  }

  return (
    <Frame
      alignItems='center'
      className={styles.light}
      data-state={state}
      display='flex'
      justifyContent='center'
      overflow='hidden'
      role='status'
      whiteSpace='nowrap'
    >
      {label}
    </Frame>
  );
}
