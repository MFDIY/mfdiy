import type { ResolvedInput } from './manifest.js';
import type { ReadoutNumber } from '../primitives/Readout.js';

/** Normalises a number signal to 0–1 using its declared range. */
export function normalise(input: ResolvedInput | undefined): number | null {
  if (!input || typeof input.value !== 'number' || input.signal.kind !== 'number') {
    return null;
  }

  const { min, max } = input.signal;

  return max === min ? 0 : (input.value - min) / (max - min);
}

export type NumberFormat = {
  decimals?: number | undefined;
  /** Pads the whole part with leading zeros to this many digits; 0 for none. */
  digits?: number | undefined;
  locale?: string | undefined;
};

/** Formats a number in the viewer's locale, padded with leading zeros if asked. */
export function formatNumber(value: number, { decimals = 0, digits = 0, locale }: NumberFormat = {}): ReadoutNumber {
  const parts = new Intl.NumberFormat(locale, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    minimumIntegerDigits: Math.min(21, Math.max(1, digits))
  }).formatToParts(value);
  const lastInteger = parts.findLastIndex(part => part.type === 'integer');
  const result: ReadoutNumber = { digits: '', sign: '', value, zeros: '' };
  let leading = true;

  parts.forEach((part, index) => {
    if (part.type === 'minusSign' || part.type === 'plusSign') {
      result.sign += part.value;
    } else if (leading && part.type === 'group') {
      result.zeros += part.value;
    } else if (leading && part.type === 'integer') {
      const keep = index === lastInteger ? 1 : 0;
      const zeros = part.value.length - part.value.replace(/^0+/, '').length;
      const dim = Math.min(zeros, part.value.length - keep);

      result.zeros += part.value.slice(0, dim);

      if (dim < part.value.length) {
        leading = false;
        result.digits += part.value.slice(dim);
      }
    } else {
      leading = false;
      result.digits += part.value;
    }
  });

  return result;
}

/** Formats any signal value for display. */
export function formatValue(input: ResolvedInput | undefined, decimals = 0): string {
  if (!input || input.value === null) {
    return '—';
  }

  const { signal, value } = input;

  if (typeof value === 'number') {
    const parts = formatNumber(value, { decimals });

    return parts.sign + parts.zeros + parts.digits;
  }

  if (typeof value === 'boolean') {
    return value ? 'ON' : 'OFF';
  }

  if (signal.kind === 'enum') {
    return signal.options.find(option => option.value === value)?.label ?? value;
  }

  return value;
}
