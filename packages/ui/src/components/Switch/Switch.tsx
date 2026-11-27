import { Field as BaseField } from '@base-ui/react/field';
import { Switch as BaseSwitch } from '@base-ui/react/switch';

import { designSystem } from '../../styles/design-system.js';
import { visuallyHidden } from '../../styles/visuallyHidden.css.js';
import { Box } from '../Box/Box.js';
import { Text } from '../Text/Text.js';
import { Toggletip } from '../Toggletip/Toggletip.js';

import * as styles from './Switch.css.js';

const rowClass = [
  designSystem({
    alignItems: 'center',
    display: 'flex',
    gap: '3x',
    justifyContent: 'space-between',
    minHeight: 'control'
  }),
  styles.row
].join(' ');

const trackClass = (disabled: boolean) =>
  [
    designSystem({
      alignItems: 'center',
      appearance: 'none',
      borderWidth: 'hairline',
      cursor: disabled ? 'not-allowed' : 'default',
      display: 'flex',
      flexShrink: '0',
      height: '5x',
      outlineColor: 'focus',
      outlineOffset: 'focus',
      outlineStyle: { default: 'none', focusVisible: 'solid' },
      outlineWidth: 'focus',
      padding: 'none',
      paddingInline: '1x',
      width: '6x'
    }),
    styles.track
  ].join(' ');

const thumbClass = [designSystem({ display: 'block', height: '4x', width: '4x' }), styles.thumb].join(' ');

export type SwitchProps = {
  checked: boolean;
  /** Explains the option: a hint in a toggletip by the label (0022), and its description for assistive technology. */
  description?: string | undefined;
  disabled?: boolean | undefined;
  /** Explains what's wrong, under the label, in the critical colour. */
  error?: string | undefined;
  /** Says what the switch turns on. Pressing it toggles the switch too. */
  label: string;
  /** Fires with the new state. */
  onChange: (checked: boolean) => void;
};

/**
 * An option that's on or off and takes effect straight away, built on Base UI's Switch (0003).
 * Square like every control (0022): on, the knob turns white and slides across over a faint tint.
 * The label sits to its left on one row, so a list of switches reads like a settings list, and the
 * whole row toggles it.
 * Controlled: the page owns the state.
 */
export function Switch({ checked, description, disabled = false, error, label, onChange }: SwitchProps) {
  return (
    <BaseField.Root disabled={disabled} invalid={Boolean(error)}>
      <Box className={rowClass}>
        <Box display='flex' flexDirection='column' gap='1x' minWidth='none'>
          <Box alignItems='center' display='flex' gap='1x'>
            <BaseField.Label
              className={styles.label}
              render={<Text color={disabled ? 'text.faint' : 'text'} tagName='label' variant='body' />}
            >
              {label}
            </BaseField.Label>
            {description ? <Toggletip label={`About ${label}`}>{description}</Toggletip> : null}
          </Box>
          {description ? <BaseField.Description className={visuallyHidden}>{description}</BaseField.Description> : null}
          {error ? (
            <BaseField.Error match render={<Text color='status.critical' variant='body' />}>
              {error}
            </BaseField.Error>
          ) : null}
        </Box>
        <BaseSwitch.Root checked={checked} className={trackClass(disabled)} onCheckedChange={next => onChange(next)}>
          <BaseSwitch.Thumb className={thumbClass} />
        </BaseSwitch.Root>
      </Box>
    </BaseField.Root>
  );
}
