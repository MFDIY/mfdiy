import type { TelemetrySource } from './source.js';
import type { ActionStatus, GameAdapter, SignalDefinition, SignalValue, SignalValues } from '@mfdiy/schema';

/**
 * Generates plausible telemetry for any adapter's signal catalogue, so the app can be built and
 * tested without the game running. Numbers drift within their range, booleans and enums change
 * occasionally, and actions named `<signal>-toggle` flip the matching boolean signal.
 */
export function createSimulator(adapter: GameAdapter, { tickMs = 50, random = Math.random } = {}): TelemetrySource {
  const values: SignalValues = Object.fromEntries(adapter.signals.map(signal => [signal.id, initialValue(signal)]));
  const listeners = new Set<(changed: SignalValues) => void>();

  function emit(changed: SignalValues) {
    if (Object.keys(changed).length > 0) {
      for (const listener of listeners) {
        listener(changed);
      }
    }
  }

  function initialValue(signal: SignalDefinition): SignalValue {
    switch (signal.kind) {
      case 'number':
        return signal.min + (signal.max - signal.min) * (0.5 + random() * 0.4);
      case 'boolean':
        return random() < 0.5;
      case 'enum':
        return signal.options[0]?.value ?? null;
      case 'string':
        return '';
    }
  }

  function nextValue(signal: SignalDefinition, current: SignalValue): SignalValue {
    switch (signal.kind) {
      case 'number': {
        const range = signal.max - signal.min;
        const value = typeof current === 'number' ? current : signal.min;
        const drifted = value + (random() - 0.5) * range * 0.02;

        // Wrap back to the top when a drifting value bottoms out, so gauges keep moving.
        return drifted <= signal.min ? signal.max : Math.min(signal.max, drifted);
      }
      case 'boolean':
        return random() < 0.002 ? !current : current;
      case 'enum':
        return random() < 0.001
          ? (signal.options[Math.floor(random() * signal.options.length)]?.value ?? current)
          : current;
      case 'string':
        return current;
    }
  }

  const timer = setInterval(() => {
    const changed: SignalValues = {};

    for (const signal of adapter.signals) {
      const next = nextValue(signal, values[signal.id] ?? null);

      if (next !== values[signal.id]) {
        values[signal.id] = next;
        changed[signal.id] = next;
      }
    }

    emit(changed);
  }, tickMs);

  return {
    kind: 'simulator',
    adapter,
    snapshot: () => ({ ...values }),
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    async triggerAction(action): Promise<ActionStatus> {
      if (!adapter.actions.some(candidate => candidate.id === action)) {
        return 'unknown-action';
      }

      await new Promise(resolve => setTimeout(resolve, 120));

      const toggled = action.endsWith('-toggle')
        ? adapter.signals.find(signal => isToggleTarget(signal, action))
        : undefined;

      if (toggled) {
        values[toggled.id] = !values[toggled.id];
        emit({ [toggled.id]: values[toggled.id] ?? null });
      }

      return 'ok';
    },
    stop() {
      clearInterval(timer);
      listeners.clear();
    }
  };
}

/** `vehicle.gear-toggle` targets `vehicle.gear` or `vehicle.gear-*` (e.g. `vehicle.gear-down`). */
function isToggleTarget(signal: SignalDefinition, action: string): boolean {
  const base = action.slice(0, -'-toggle'.length);
  const decoupleAlias = base.replace(/decouple$/, 'decoupled');

  return (
    signal.kind === 'boolean' &&
    [base, decoupleAlias].some(stem => signal.id === stem || signal.id.startsWith(`${stem}-`))
  );
}
