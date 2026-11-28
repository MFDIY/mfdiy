import { Frame } from './Frame.js';
import * as styles from './Light.css.js';

export const lightStates = ['off', 'on', 'warning', 'critical'] as const;

export type LightState = (typeof lightStates)[number];

export type LightProps = {
  label: string;
  state: LightState;
};

/** An annunciator light. Given an action, it's a lit push-button, like in a cockpit (0018). */
export function Light({ label, state }: LightProps) {
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
