import type { SteadyOptions } from './steady.js';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { useEffect, useState } from 'react';

import { Comparison } from '../primitives/Comparison.js';
import { Readout } from '../primitives/Readout.js';

import { formatNumber } from './format.js';
import { useSteadyNumber } from './useSteadyNumber.js';

const TICK_MS = 50;
const MAX_SPEED = 1400;

type Signals = { cruising: number; ramp: number; simulator: number; time: number };

/** The bridge's simulator: a random walk of up to 1 % of the range each tick, wrapping at the bottom. */
function simulatorStep(value: number): number {
  const drifted = value + (Math.random() - 0.5) * MAX_SPEED * 0.02;

  return drifted <= 0 ? MAX_SPEED : Math.min(MAX_SPEED, drifted);
}

/** Holding a speed, with the small noise a real feed likely has. */
function cruising(time: number): number {
  return 412 + Math.sin(time / 4000) * 3 + (Math.random() - 0.5) * 1.6;
}

/** Up to 1200 m/s in 6 s, back down in 6 s, then holding for 3 s. */
function ramp(time: number): number {
  const phase = (time / 1000) % 15;
  const noise = (Math.random() - 0.5) * 0.8;

  if (phase < 6) {
    return (phase / 6) * 1200 + noise;
  }

  if (phase < 12) {
    return ((12 - phase) / 6) * 1200 + noise;
  }

  return Math.max(0, noise);
}

function useSignals(): Signals {
  const [signals, setSignals] = useState<Signals>({ cruising: 412, ramp: 0, simulator: 700, time: 0 });

  useEffect(() => {
    const timer = setInterval(
      () =>
        setSignals(previous => {
          const time = previous.time + TICK_MS;

          return { cruising: cruising(time), ramp: ramp(time), simulator: simulatorStep(previous.simulator), time };
        }),
      TICK_MS
    );

    return () => clearInterval(timer);
  }, []);

  return signals;
}

function SteadyReadout({ options, rolling, value }: { options: SteadyOptions; rolling: boolean; value: number }) {
  const shown = useSteadyNumber(value, options) ?? value;

  return <Readout label='Speed' rolling={rolling} unit='m/s' value={formatNumber(shown, { digits: 4 })} />;
}

const ways: { name: string; options: Omit<SteadyOptions, 'step'>; rolling?: boolean }[] = [
  { name: 'As it comes', options: {} },
  { name: 'Deadband', options: { deadband: true } },
  { name: '4 a second', options: { interval: 250 } },
  { name: 'Deadband, 4 a second', options: { deadband: true, interval: 250 } },
  { name: 'Fewer digits when fast', options: { coarseAbove: 40, deadband: true } },
  { name: 'Rolling digits', options: {}, rolling: true },
  { name: 'Deadband, rolling', options: { deadband: true }, rolling: true },
  { name: 'Fewer digits, rolling', options: { coarseAbove: 40, deadband: true }, rolling: true }
];

const columns = ['Simulator speed', 'Cruising, with noise', 'Speeding up, braking, holding'] as const;

function Steadying({ themeName }: { themeName: string }) {
  const signals = useSignals();
  const values = [signals.simulator, signals.cruising, signals.ramp];

  return (
    <Comparison
      cell={{ height: 88, width: 200 }}
      columns={columns}
      rows={ways.map(way => ({
        name: way.name,
        cells: values.map((value, index) => (
          <SteadyReadout
            key={columns[index]}
            options={{ ...way.options, step: 1 }}
            rolling={way.rolling ?? false}
            value={value}
          />
        ))
      }))}
      themeName={themeName}
    />
  );
}

/**
 * Temporary: ways to keep a fast-changing number readable, side by side on the same live values,
 * 20 times a second like the game's feed (0018). Rolling digits need motion: they don't move with
 * reduced motion turned on.
 */
export default {
  title: 'Widgets/Steadying',
  tags: ['!autodocs', '!visual'],
  render: (_args, context) => <Steadying themeName={String(context.globals['theme'] ?? '')} />
} satisfies Meta;

export const Compare: StoryObj = {};
