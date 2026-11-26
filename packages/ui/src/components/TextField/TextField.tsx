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
      <Text color='text.dim' htmlFor={id} tagName='label' variant='label'>
        {label}
      </Text>
      <Box
        autoComplete='off'
        backgroundColor='transparent'
        borderColor={{ default: 'line', hover: 'line.strong', focusVisible: 'focus' }}
        borderStyle='solid'
        borderWidth='hairline'
        boxShadow={{ default: 'none', focusVisible: 'focus.glow' }}
        color='text'
        fontSize='body'
        fontWeight='regular'
        height='control'
        id={id}
        letterSpacing='none'
        lineHeight='body'
        maxLength={maxLength}
        onChange={event => onChange(event.target.value)}
        onFocus={event => event.target.select()}
        outlineStyle='none'
        paddingInline='3x'
        tagName='input'
        type='text'
        value={value}
        width='full'
      />
    </Stack>
  );
}
