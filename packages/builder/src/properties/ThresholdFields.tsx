import type { Merge } from './fields.js';
import type { NumberSignal, ThresholdLevels, Thresholds } from '@mfdiy/schema';
import type { FocusEvent } from 'react';

import { Columns, NumberField, Stack, Switch } from '@mfdiy/ui/components';

import { Typing } from './fields.js';

type Side = 'high' | 'low';

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

/** Says when critical comes before warning, which would hide the warning. */
function orderError(side: Side, { critical, warning }: ThresholdLevels): string | undefined {
  if (critical === undefined || warning === undefined) {
    return undefined;
  }

  if (side === 'low' && critical > warning) {
    return 'Critical is above warning, so it never warns first.';
  }

  return side === 'high' && critical < warning ? 'Critical is below warning, so it never warns first.' : undefined;
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
                  <Typing key={level} onBlur={onBlur} share>
                    <NumberField
                      error={level === 'critical' ? orderError(side, levels) : undefined}
                      label={level === 'warning' ? 'Warning' : 'Critical'}
                      max={signal.max}
                      min={signal.min}
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
                ))}
              </Columns>
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );
}
