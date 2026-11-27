import * as styles from './Button.css.js';
import { Frame } from './Frame.js';
import { pressHandlers } from './pressHandlers.js';

export const buttonStatuses = ['idle', 'pending', 'ok', 'failed'] as const;

export type ButtonStatus = (typeof buttonStatuses)[number];

export type ButtonProps = {
  /** Marks a page button whose page is shown (0018). */
  current?: boolean | undefined;
  disabled?: boolean | undefined;
  label: string;
  onPress: () => void;
  /** Feedback from the last press, so users can see whether the game accepted it. */
  status: ButtonStatus;
};

/** A touch-friendly button that triggers an action. */
export function Button({ current = false, disabled = false, label, onPress, status }: ButtonProps) {
  return (
    <Frame
      {...pressHandlers(onPress, disabled)}
      alignItems='center'
      appearance='none'
      aria-current={current ? 'page' : undefined}
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
