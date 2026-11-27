import type { Merge } from './fields.js';
import type { NumberSignal, ThresholdLevels, Thresholds } from '@mfdiy/schema';
import type { FocusEvent } from 'react';

import { Box, Columns, NumberField, Stack, Switch } from '@mfdiy/ui/components';

import { Typing } from './fields.js';

type Side = 'high' | 'low';

type Level = 'critical' | 'warning';

type ThresholdFieldsProps = {
  /** Which input they belong to, to tell its fields apart. */
  input: string;
  merge: Merge;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
  onChange: (thresholds: Thresholds | undefined, merge?: string) => void;
  signal: NumberSignal;
  thresholds: Thresholds | undefined;
};

const sides: readonly { side: Side; label: string }[] = [
  { side: 'low', label: 'Warn when low' },
  { side: 'high', label: 'Warn when high' }
];

/** Where a side starts when it's switched on: the signal's defaults, or a quarter and a tenth in. */
function startingLevels(signal: NumberSignal, side: Side): ThresholdLevels {
  const defaults = signal.thresholds?.[side];

  if (defaults) {
    return defaults;
  }

  const range = signal.max - signal.min;
  const towards = (share: number) =>
    Math.round(side === 'low' ? signal.min + range * share : signal.max - range * share);

  return { warning: towards(0.25), critical: towards(0.1) };
}

/**
 * How far a level can go: within the signal's range, and never past the other level, so a value
 * always warns before it turns critical. Limiting the field means no message has to appear (0023).
 */
function limits(signal: NumberSignal, side: Side, level: Level, levels: ThresholdLevels) {
  const other = level === 'warning' ? levels.critical : levels.warning;
  const aboveOther = (side === 'low') === (level === 'warning');

  return aboveOther ? { min: other ?? signal.min, max: signal.max } : { min: signal.min, max: other ?? signal.max };
}

/** A binding's thresholds (0023): a low and a high side, each with a warning and a critical level. */
export function ThresholdFields({ input, merge, onBlur, onChange, signal, thresholds }: ThresholdFieldsProps) {
  function setSide(side: Side, levels: ThresholdLevels | undefined, mergeKey?: string) {
    const { [side]: _replaced, ...others } = thresholds ?? {};
    const next = levels ? { ...others, [side]: levels } : others;

    onChange(Object.keys(next).length > 0 ? next : undefined, mergeKey);
  }

  const step = signal.max - signal.min <= 10 ? 0.1 : 1;

  return (
    <Stack spacing='4x'>
      {sides.map(({ side, label }) => {
        const levels = thresholds?.[side];

        return (
          <Stack key={side} spacing='3x'>
            <Switch
              checked={levels !== undefined}
              label={label}
              onChange={checked => setSide(side, checked ? startingLevels(signal, side) : undefined)}
            />
            {levels ? (
              <Columns spacing='3x'>
                {(['warning', 'critical'] as const).map(level => (
                  <Box flexBasis='fluid' flexGrow='1' key={level} minWidth='none'>
                    <Typing onBlur={onBlur}>
                      <NumberField
                        {...limits(signal, side, level, levels)}
                        label={level === 'warning' ? 'Warning' : 'Critical'}
                        onChange={value => {
                          const { [level]: _replaced, ...others } = levels;

                          setSide(
                            side,
                            value === null ? others : { ...others, [level]: value },
                            merge(`${input} ${side} ${level}`)
                          );
                        }}
                        step={step}
                        unit={signal.unit}
                        value={levels[level] ?? null}
                      />
                    </Typing>
                  </Box>
                ))}
              </Columns>
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );
}
