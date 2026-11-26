import { useId } from 'react';

import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

export type TextFieldProps = {
  label: string;
  /** Explains what's wrong with the value. Shown under the field, which turns red. */
  error?: string | undefined;
  disabled?: boolean | undefined;
  maxLength?: number | undefined;
  /** Fires with the new value. */
  onChange: (value: string) => void;
  /** Shown while the field is empty. */
  placeholder?: string | undefined;
  value: string;
};

/** A labelled, single-line text field with the shared control height and Button's focus ring. */
export function TextField({ disabled, error, label, maxLength, onChange, placeholder, value }: TextFieldProps) {
  const id = useId();
  const errorId = useId();

  return (
    <Stack spacing='2x'>
      <Text color='text.dim' htmlFor={id} tagName='label' variant='label'>
        {label}
      </Text>
      <Box
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        autoComplete='off'
        backgroundColor='transparent'
        borderColor={error ? 'status.critical' : { default: 'line', hover: 'line.strong', disabled: 'line' }}
        borderStyle={disabled ? 'dashed' : 'solid'}
        borderWidth='hairline'
        color={{ default: 'text', placeholder: 'text.faint', disabled: 'text.faint' }}
        cursor={{ default: 'text', disabled: 'not-allowed' }}
        disabled={disabled}
        fontSize='body'
        fontWeight='regular'
        height='control'
        id={id}
        letterSpacing='none'
        lineHeight='body'
        maxLength={maxLength}
        onChange={event => onChange(event.target.value)}
        onFocus={event => event.target.select()}
        outlineColor='focus'
        outlineOffset='focus'
        outlineStyle={{ default: 'none', focusVisible: 'solid' }}
        outlineWidth='focus'
        paddingInline='3x'
        placeholder={placeholder}
        tagName='input'
        type='text'
        value={value}
        width='full'
      />
      {error ? (
        <Text color='status.critical' id={errorId} variant='body'>
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}
