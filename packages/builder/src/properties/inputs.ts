import type { Binding, SignalDefinition, Thresholds } from '@mfdiy/schema';

import { bindingFor } from '@mfdiy/schema';

const levelsOf = (thresholds: Thresholds | undefined) =>
  (['low', 'high'] as const).flatMap(side => [thresholds?.[side]?.warning, thresholds?.[side]?.critical]);

/** Whether an input's thresholds and hold are its signal's defaults, so Reset has nothing to do. */
export function atDefaults(binding: Binding, signal: SignalDefinition): boolean {
  const defaults = bindingFor(signal);
  const ours = levelsOf(binding.thresholds);

  return !binding.holdSeconds && levelsOf(defaults.thresholds).every((level, index) => level === ours[index]);
}

/** What an input shows, at a glance: its signal and thresholds, e.g. "Hydrogen fuel · low 25 / 10 %". */
export function inputSummary(binding: Binding | undefined, signal: SignalDefinition | undefined): string {
  if (!binding) {
    return 'Not connected';
  }

  const unit = signal?.kind === 'number' && signal.unit ? ` ${signal.unit}` : '';
  const sides = (['low', 'high'] as const).flatMap(side => {
    const levels = binding.thresholds?.[side];

    if (!levels) {
      return [];
    }

    const values = [levels.warning, levels.critical].filter(value => value !== undefined).join(' / ');

    return values ? [`${side} ${values}${unit}`] : [];
  });

  return [signal?.label ?? binding.signal, ...sides].join(' · ');
}
