import type { ReactNode } from 'react';

import { Field as BaseField } from '@base-ui/react/field';

import { designSystem } from '../../styles/design-system.js';
import { visuallyHidden } from '../../styles/visuallyHidden.css.js';
import { Box } from '../Box/Box.js';
import { Text } from '../Text/Text.js';
import { Toggletip } from '../Toggletip/Toggletip.js';

const rootClass = designSystem({ display: 'flex', flexDirection: 'column', gap: '2x' });

export type FieldProps = {
  /** The control, e.g. a `NumberField` or `Select`; Base UI's controls take the label by themselves. */
  children: ReactNode;
  /** Explains the field: a hint in a toggletip by the label (0022), and the field's description for assistive technology. */
  description?: string | undefined;
  disabled?: boolean | undefined;
  /** Explains what's wrong with the value, under the control, in the critical colour. */
  error?: string | undefined;
  label: string;
};

/**
 * A label, a control, and what explains it: a description and an error. Built on Base UI's Field
 * (0003), which ties the label and messages to the control for assistive technology.
 */
export function Field({ children, description, disabled = false, error, label }: FieldProps) {
  return (
    <BaseField.Root className={rootClass} disabled={disabled} invalid={Boolean(error)}>
      <Box alignItems='center' display='flex' gap='1x'>
        <BaseField.Label render={<Text color={disabled ? 'text.faint' : 'text.dim'} tagName='label' variant='label' />}>
          {label}
        </BaseField.Label>
        {description ? <Toggletip label={`About ${label}`}>{description}</Toggletip> : null}
      </Box>
      {children}
      {description ? <BaseField.Description className={visuallyHidden}>{description}</BaseField.Description> : null}
      {error ? (
        <BaseField.Error match render={<Text color='status.critical' variant='body' />}>
          {error}
        </BaseField.Error>
      ) : null}
    </BaseField.Root>
  );
}
