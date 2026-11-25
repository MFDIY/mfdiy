import { useId } from 'react';

import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

export type TextFieldProps = {
  label: string;
  maxLength?: number | undefined;
  /** Fires with the new value. */
  onChange: (value: string) => void;
  value: string;
};

export function TextField({ label, maxLength, onChange, value }: TextFieldProps) {
  const id = useId();

  return (
    <Stack spacing='2x'>
      <Text htmlFor={id} tagName='label' variant='field.label'>
        {label}
      </Text>
      <Box
        autoComplete='off'
        backgroundColor='elevation.depressed'
        borderColor='input.text'
        borderRadius='2x'
        borderStyle='solid'
        borderWidth='input.text'
        color='input.text'
        fontSize='input.text'
        fontWeight='input'
        id={id}
        letterSpacing='input'
        lineHeight='input'
        maxLength={maxLength}
        onChange={event => onChange(event.target.value)}
        onFocus={event => event.target.select()}
        outlineColor='focus-ring'
        outlineStyle={{ default: 'none', focusVisible: 'solid' }}
        outlineWidth='focus-ring'
        padding='3x'
        tagName='input'
        type='text'
        value={value}
        width='full'
      />
    </Stack>
  );
}
