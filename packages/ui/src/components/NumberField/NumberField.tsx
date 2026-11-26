import { NumberField as BaseNumberField } from '@base-ui/react/number-field';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Field } from '../Field/Field.js';
import { fieldBoxClass, fieldButtonClass } from '../Field/fieldStyles.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

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
        <BaseNumberField.Group className={fieldBoxClass({ disabled, invalid: Boolean(error), open: false })}>
          <BaseNumberField.Input className={inputClass(Boolean(unit))} />
          {unit ? (
            <Box alignSelf='center' paddingRight='3x'>
              <Text color='text.dim' variant='body'>
                {unit}
              </Text>
            </Box>
          ) : null}
          <BaseNumberField.Decrement aria-label='Decrease' className={fieldButtonClass}>
            <Icon name='remove' />
          </BaseNumberField.Decrement>
          <BaseNumberField.Increment aria-label='Increase' className={fieldButtonClass}>
            <Icon name='add' />
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    </Field>
  );
}
