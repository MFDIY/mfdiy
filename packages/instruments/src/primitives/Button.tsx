import * as styles from './Button.css.js';
import { Frame } from './Frame.js';
import { pressHandlers } from './pressHandlers.js';

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
    <Frame
      {...pressHandlers(onPress, disabled)}
      alignItems='center'
      appearance='none'
      className={styles.button}
      cursor={{ default: 'pointer', disabled: 'not-allowed' }}
      data-status={status}
      disabled={disabled}
      display='flex'
      justifyContent='center'
      tagName='button'
      touchAction='none'
      type='button'
      userSelect='none'
    >
      {label}
    </Frame>
  );
}
