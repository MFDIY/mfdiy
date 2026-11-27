import { Field as BaseField } from '@base-ui/react/field';
import { useEffect, useRef } from 'react';

import { Field } from '../Field/Field.js';
import { TextInput } from '../TextInput/TextInput.js';

export type TextFieldProps = {
  /** Shows a button that empties the field while it has text. */
  clearable?: boolean | undefined;
  /** Explains the field: a hint in a toggletip by the label (0022). */
  description?: string | undefined;
  disabled?: boolean | undefined;
  /** Explains what's wrong with the value. Shown under the field, which turns red. */
  error?: string | undefined;
  /** Moves focus to the field, selecting its text, when it's shown and whenever this turns `true`. */
  focus?: boolean | undefined;
  label: string;
  maxLength?: number | undefined;
  /** Fires with the new value. */
  onChange: (value: string) => void;
  /** Shown while the field is empty. */
  placeholder?: string | undefined;
  value: string;
};

/** A labelled, single-line text field: a `TextInput` in a `Field`. Its border brightens while focused. */
export function TextField({
  clearable = false,
  description,
  disabled = false,
  error,
  focus = false,
  label,
  maxLength,
  onChange,
  placeholder,
  value
}: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus) {
      inputRef.current?.focus();
    }
  }, [focus]);

  return (
    <Field description={description} disabled={disabled} error={error} label={label}>
      <BaseField.Control
        maxLength={maxLength}
        onFocus={event => event.target.select()}
        onValueChange={next => onChange(next)}
        placeholder={placeholder}
        ref={inputRef}
        render={
          <TextInput disabled={disabled} error={Boolean(error)} onClear={clearable ? () => onChange('') : undefined} />
        }
        value={value}
      />
    </Field>
  );
}
