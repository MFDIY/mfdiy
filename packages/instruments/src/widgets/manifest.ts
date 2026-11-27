import type { ButtonStatus } from '../primitives/Button.js';
import type { ComponentType } from 'react';

import {
  thresholdState,
  type Binding,
  type SignalDefinition,
  type SignalKind,
  type SignalState,
  type SignalValue,
  type Thresholds,
  type TokenName
} from '@mfdiy/schema';

/** A widget input that can be bound to a signal. */
export type InputSpec = {
  label: string;
  /** Signal kinds this input accepts; the builder only offers compatible signals. */
  accepts: readonly SignalKind[];
  /** Only numbers whose range means something, e.g. for a gauge (0023). */
  bounded?: boolean | undefined;
  required: boolean;
};

/** Whether an input can show a signal: its kind, and for a gauge, a range that means something. */
export function acceptsSignal(spec: InputSpec, signal: SignalDefinition): boolean {
  return spec.accepts.includes(signal.kind) && !(spec.bounded && signal.kind === 'number' && signal.unbounded);
}

/** A static widget setting the user fills in, e.g. a label override. */
export type OptionSpec =
  | { label: string; type: 'string'; default: string }
  | { label: string; type: 'number'; default: number; min?: number; max?: number }
  | { label: string; type: 'boolean'; default: boolean };

export type OptionValue = string | number | boolean;

/**
 * A bound input as the widget receives it: the signal's definition, its current value, and how much
 * attention that value needs by the binding's thresholds. Widgets colour themselves by `state` and
 * never work it out; `thresholds` is there for those that mark them, like a gauge's red line (0023).
 */
export type ResolvedInput = {
  signal: SignalDefinition;
  state: SignalState;
  thresholds: Thresholds | undefined;
  value: SignalValue;
};

/** What a widget receives for a binding, given the signal it names and that signal's value. */
export function resolveInput(
  signal: SignalDefinition,
  value: SignalValue,
  binding: Binding | undefined
): ResolvedInput {
  return { signal, state: thresholdState(value, binding?.thresholds), thresholds: binding?.thresholds, value };
}

export type WidgetAction = {
  label: string;
  status: ButtonStatus;
  available: boolean;
  trigger: () => void;
};

export type WidgetProps = {
  inputs: Partial<Record<string, ResolvedInput>>;
  options: Record<string, OptionValue>;
  action: WidgetAction | undefined;
};

/**
 * Describes a widget type to the builder and renderer. The builder generates property panels from
 * `inputs` and `options`; it never needs widget-specific code. See docs/decisions/0003.
 */
export type WidgetManifest = {
  /** Stable identifier stored in documents, e.g. `light`. */
  type: string;
  label: string;
  description: string;
  inputs: Record<string, InputSpec>;
  options: Record<string, OptionSpec>;
  /** Whether the widget can trigger a game action when pressed. */
  actionable: boolean;
  /** Size of a new widget as a share of the page, so it looks the same on any grid density (0006). */
  defaultSize: { width: number; height: number };
  /** In cells. */
  minSize: { columns: number; rows: number };
  /** Tokens the widget reads, offered for per-widget overrides in the builder. */
  tokens: readonly TokenName[];
  Component: ComponentType<WidgetProps>;
};

export function readOption<T extends OptionValue>(props: WidgetProps, key: string, fallback: T): T {
  const value = props.options[key];

  return typeof value === typeof fallback ? (value as T) : fallback;
}
