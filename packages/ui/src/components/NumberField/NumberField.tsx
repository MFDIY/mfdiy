import { NumberField as BaseNumberField } from '@base-ui/react/number-field';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Field } from '../Field/Field.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

const groupClass = (invalid: boolean, disabled: boolean) =>
  designSystem({
    alignItems: 'stretch',
    borderColor: invalid
      ? 'status.critical'
      : { default: 'line', hover: 'line.strong', active: 'focus', focusWithin: 'focus', disabled: 'line' },
    borderStyle: disabled ? 'dashed' : 'solid',
    borderWidth: 'hairline',
    display: 'flex',
    height: 'control',
    width: 'full'
  });

const inputClass = (hasUnit: boolean) =>
  designSystem({
    backgroundColor: 'transparent',
    borderStyle: 'hidden',
    color: { default: 'text', disabled: 'text.faint' },
    cursor: { default: 'text', disabled: 'not-allowed' },
    flexGrow: '1',
    fontFamily: 'inherit',
    fontSize: 'body',
    fontWeight: 'regular',
    letterSpacing: 'none',
    lineHeight: 'body',
    minWidth: 'none',
    outlineStyle: 'none',
    paddingLeft: '3x',
    paddingRight: hasUnit ? '1x' : '3x',
    textAlign: 'right'
  });

const stepClass = designSystem({
  alignItems: 'center',
  appearance: 'none',
  backgroundColor: { default: 'transparent', hover: 'hover', active: 'pressed', disabled: 'transparent' },
  borderBottomStyle: 'hidden',
  borderLeftColor: 'inherit',
  borderLeftStyle: 'solid',
  borderLeftWidth: 'hairline',
  borderRightStyle: 'hidden',
  borderTopStyle: 'hidden',
  color: { default: 'text', disabled: 'text.faint' },
  cursor: { default: 'default', disabled: 'not-allowed' },
  display: 'flex',
  flexShrink: '0',
  justifyContent: 'center',
  outlineStyle: 'none',
  padding: 'none',
  width: 'control'
});

export type NumberFieldProps = {
  /** Explains the field, under it. */
  description?: string | undefined;
  disabled?: boolean | undefined;
  /** Explains what's wrong with the value. Shown under the field, which turns red. */
  error?: string | undefined;
  label: string;
  max?: number | undefined;
  min?: number | undefined;
  /** Fires with the new value, or `null` when the field is emptied. */
  onChange: (value: number | null) => void;
  /** How much the buttons and arrow keys change the value. Defaults to 1. */
  step?: number | undefined;
  /** What the value is counted in, shown after it, e.g. "%" or "m/s". */
  unit?: string | undefined;
  value: number | null;
};

/**
 * A labelled number with − and + buttons, built on Base UI's NumberField (0003): arrow keys step it,
 * and it stays between `min` and `max`. The number is right-aligned, next to its unit (0022).
 * Controlled: the page owns the value.
 */
export function NumberField({
  description,
  disabled = false,
  error,
  label,
  max,
  min,
  onChange,
  step,
  unit,
  value
}: NumberFieldProps) {
  return (
    <Field description={description} disabled={disabled} error={error} label={label}>
      <BaseNumberField.Root
        disabled={disabled}
        max={max}
        min={min}
        onValueChange={next => onChange(next)}
        step={step}
        value={value}
      >
        <BaseNumberField.Group className={groupClass(Boolean(error), disabled)}>
          <BaseNumberField.Input className={inputClass(Boolean(unit))} />
          {unit ? (
            <Box alignSelf='center' paddingRight='3x'>
              <Text color='text.dim' variant='body'>
                {unit}
              </Text>
            </Box>
          ) : null}
          <BaseNumberField.Decrement aria-label='Decrease' className={stepClass}>
            <Icon name='remove' />
          </BaseNumberField.Decrement>
          <BaseNumberField.Increment aria-label='Increase' className={stepClass}>
            <Icon name='add' />
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    </Field>
  );
}
