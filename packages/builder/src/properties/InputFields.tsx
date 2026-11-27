import type { Merge } from './fields.js';
import type { Binding, SignalDefinition } from '@mfdiy/schema';
import type { FocusEvent } from 'react';

import { bindingFor } from '@mfdiy/schema';
import { Box, Button, Inline, NumberField, Stack, Toggletip } from '@mfdiy/ui/components';

import { ThresholdFields } from './ThresholdFields.js';
import { OpensRow, Typing } from './fields.js';
import { atDefaults } from './inputs.js';

type InputFieldsProps = {
  binding: Binding | undefined;
  /** Names the input's fields apart from other inputs', for undo. */
  input: string;
  merge: Merge;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
  /** Fires with the changed binding; `merge` names a run of typing (0023). */
  onChange: (binding: Binding, merge?: string) => void;
  onPick: () => void;
  signal: SignalDefinition | undefined;
};

/** Everything about one of a widget's inputs (0023): its signal, thresholds, Hold state for and Reset. */
export function InputFields({ binding, input, merge, onBlur, onChange, onPick, signal }: InputFieldsProps) {
  const numeric = binding && signal?.kind === 'number' ? signal : undefined;

  return (
    <Stack spacing='4x'>
      <OpensRow empty='Not connected' label='Signal' onOpen={onPick} value={signal?.label ?? binding?.signal} />
      {binding && numeric ? (
        <>
          <ThresholdFields
            input={input}
            merge={merge}
            onBlur={onBlur}
            onChange={(thresholds, mergeKey) => {
              const { thresholds: _replaced, ...rest } = binding;

              onChange(thresholds ? { ...rest, thresholds } : rest, mergeKey);
            }}
            signal={numeric}
            thresholds={binding.thresholds}
          />
          <Typing onBlur={onBlur}>
            <NumberField
              description='Keeps a warning showing for this long after the value is back, instead of clearing at once. Warnings still show straight away. Useful to reduce flickering.'
              label='Hold state for'
              max={60}
              min={0}
              onChange={value => {
                const { holdSeconds: _replaced, ...rest } = binding;

                onChange(value ? { ...rest, holdSeconds: value } : rest, merge(`${input} hold`));
              }}
              step={0.5}
              unit='s'
              value={binding.holdSeconds ?? 0}
            />
          </Typing>
          <Inline alignItems='center' spacing='1x'>
            <Box>
              <Button disabled={atDefaults(binding, numeric)} icon='undo' onClick={() => onChange(bindingFor(numeric))}>
                Reset
              </Button>
            </Box>
            <Toggletip label='About Reset'>
              {`Puts this input's thresholds and Hold state for back to ${numeric.label}'s defaults.`}
            </Toggletip>
          </Inline>
        </>
      ) : null}
    </Stack>
  );
}
