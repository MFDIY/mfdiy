import { Field as BaseField } from '@base-ui/react/field';
import { Switch as BaseSwitch } from '@base-ui/react/switch';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Text } from '../Text/Text.js';

import * as styles from './Switch.css.js';

const rowClass = designSystem({
  alignItems: 'center',
  display: 'flex',
  gap: '3x',
  justifyContent: 'space-between',
  minHeight: 'control'
});

const trackClass = ({ checked, disabled }: { checked: boolean; disabled: boolean }) =>
  designSystem({
    alignItems: 'center',
    appearance: 'none',
    backgroundColor:
      checked && !disabled ? { default: 'accent', hover: 'accent.hover', active: 'accent.pressed' } : 'transparent',
    borderColor: disabled
      ? 'line.strong'
      : checked
        ? 'accent'
        : { default: 'line.strong', hover: 'accent', active: 'accent' },
    borderStyle: disabled ? 'dashed' : 'solid',
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
  });

const thumbClass = ({ checked, disabled }: { checked: boolean; disabled: boolean }) =>
  [
    designSystem({
      backgroundColor: checked && !disabled ? 'surface' : 'line.strong',
      display: 'block',
      height: '4x',
      width: '4x'
    }),
    styles.thumb
  ].join(' ');

export type SwitchProps = {
  checked: boolean;
  /** Explains the option, under its label. */
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
 * Square like every control (0022): on, the track fills with the accent and the knob slides across.
 * The label sits to its left on one row, so a list of switches reads like a settings list.
 * Controlled: the page owns the state.
 */
export function Switch({ checked, description, disabled = false, error, label, onChange }: SwitchProps) {
  return (
    <BaseField.Root disabled={disabled} invalid={Boolean(error)}>
      <Box className={rowClass}>
        <Box display='flex' flexDirection='column' gap='1x' minWidth='none'>
          <BaseField.Label render={<Text color={disabled ? 'text.faint' : 'text'} tagName='label' variant='body' />}>
            {label}
          </BaseField.Label>
          {description ? (
            <BaseField.Description render={<Text color='text.dim' variant='body' />}>
              {description}
            </BaseField.Description>
          ) : null}
          {error ? (
            <BaseField.Error match render={<Text color='status.critical' variant='body' />}>
              {error}
            </BaseField.Error>
          ) : null}
        </Box>
        <BaseSwitch.Root
          checked={checked}
          className={state => trackClass({ checked: state.checked, disabled: state.disabled })}
          onCheckedChange={next => onChange(next)}
        >
          <BaseSwitch.Thumb className={state => thumbClass({ checked: state.checked, disabled: state.disabled })} />
        </BaseSwitch.Root>
      </Box>
    </BaseField.Root>
  );
}
