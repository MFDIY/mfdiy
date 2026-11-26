import type { Binding, MfdDocument } from './document.js';
import type { SignalDefinition, Thresholds } from './signals.js';

export const signalStates = ['normal', 'warning', 'critical'] as const;

/** How much attention a value needs: none, soon (amber) or now (red). */
export type SignalState = (typeof signalStates)[number];

/** A value's state by its thresholds. A value exactly at a threshold has crossed it. */
export function thresholdState(value: unknown, thresholds: Thresholds | undefined): SignalState {
  if (typeof value !== 'number' || !thresholds) {
    return 'normal';
  }

  const { high, low } = thresholds;
  const crossed = (level: 'critical' | 'warning') =>
    (low?.[level] !== undefined && value <= low[level]) || (high?.[level] !== undefined && value >= high[level]);

  return crossed('critical') ? 'critical' : crossed('warning') ? 'warning' : 'normal';
}

/** A binding to a signal, starting from the signal's default thresholds (0023). */
export function bindingFor(signal: SignalDefinition): Binding {
  return signal.kind === 'number' && signal.thresholds
    ? { signal: signal.id, thresholds: structuredClone(signal.thresholds) }
    : { signal: signal.id };
}

/** Gives every binding without thresholds its signal's defaults, e.g. for hand-written documents. */
export function withDefaultThresholds(document: MfdDocument, signals: readonly SignalDefinition[]): MfdDocument {
  return {
    ...document,
    pages: document.pages.map(page => ({
      ...page,
      widgets: page.widgets.map(widget => ({
        ...widget,
        ...(widget.bindings
          ? {
              bindings: Object.fromEntries(
                Object.entries(widget.bindings).map(([input, binding]) => {
                  const signal = signals.find(candidate => candidate.id === binding.signal);

                  return [input, binding.thresholds || !signal ? binding : bindingFor(signal)];
                })
              )
            }
          : {})
      }))
    }))
  };
}
