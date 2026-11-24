import type { ResolvedInput } from './manifest.js';

/** Normalises a number signal to 0–1 using its declared range. */
export function normalise(input: ResolvedInput | undefined): number | null {
  if (!input || typeof input.value !== 'number' || input.signal.kind !== 'number') {
    return null;
  }

  const { min, max } = input.signal;

  return max === min ? 0 : (input.value - min) / (max - min);
}

/** Formats any signal value for display. */
export function formatValue(input: ResolvedInput | undefined, decimals = 0): string {
  if (!input || input.value === null) {
    return '—';
  }

  const { signal, value } = input;

  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
  }

  if (typeof value === 'boolean') {
    return value ? 'ON' : 'OFF';
  }

  if (signal.kind === 'enum') {
    return signal.options.find(option => option.value === value)?.label ?? value;
  }

  return value;
}
