import { Field as BaseField } from '@base-ui/react/field';

import { designSystem } from '../../styles/design-system.js';
import { Field } from '../Field/Field.js';

const inputClass = (invalid: boolean, disabled: boolean) =>
  designSystem({
    backgroundColor: 'transparent',
    borderColor: invalid
      ? 'status.critical'
      : { default: 'line', hover: 'line.strong', active: 'focus', focusVisible: 'focus', disabled: 'line' },
    borderStyle: disabled ? 'dashed' : 'solid',
    borderWidth: 'hairline',
    color: { default: 'text', placeholder: 'text.faint', disabled: 'text.faint' },
    cursor: { default: 'text', disabled: 'not-allowed' },
    fontFamily: 'inherit',
    fontSize: 'body',
    fontWeight: 'regular',
    height: 'control',
    letterSpacing: 'none',
    lineHeight: 'body',
    outlineStyle: 'none',
    paddingInline: '3x',
    width: 'full'
  });

export type TextFieldProps = {
  /** Explains the field, under it. */
  description?: string | undefined;
  disabled?: boolean | undefined;
  /** Explains what's wrong with the value. Shown under the field, which turns red. */
  error?: string | undefined;
  label: string;
  maxLength?: number | undefined;
  /** Fires with the new value. */
  onChange: (value: string) => void;
  /** Shown while the field is empty. */
  placeholder?: string | undefined;
  value: string;
};

/** A labelled, single-line text field with the shared control height. Its border brightens while focused. */
export function TextField({
  description,
  disabled = false,
  error,
  label,
  maxLength,
  onChange,
  placeholder,
  value
}: TextFieldProps) {
  return (
    <Field description={description} disabled={disabled} error={error} label={label}>
      <BaseField.Control
        autoComplete='off'
        className={inputClass(Boolean(error), disabled)}
        maxLength={maxLength}
        onFocus={event => event.target.select()}
        onValueChange={next => onChange(next)}
        placeholder={placeholder}
        value={value}
      />
    </Field>
  );
}
