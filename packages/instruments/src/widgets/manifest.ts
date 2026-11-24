import type { ButtonStatus } from '../primitives/Button.js';
import type { SignalDefinition, SignalKind, SignalValue, TokenName } from '@mfdiy/schema';
import type { ComponentType } from 'react';

/** A widget input that can be bound to a signal. */
export type InputSpec = {
  label: string;
  /** Signal kinds this input accepts; the builder only offers compatible signals. */
  accepts: readonly SignalKind[];
  required: boolean;
};

/** A static widget setting the user fills in, e.g. a label override. */
export type OptionSpec =
  | { label: string; type: 'string'; default: string }
  | { label: string; type: 'number'; default: number; min?: number; max?: number }
  | { label: string; type: 'boolean'; default: boolean };

export type OptionValue = string | number | boolean;

/** A bound input as the widget receives it: the signal's definition and its current value. */
export type ResolvedInput = {
  signal: SignalDefinition;
  value: SignalValue;
};

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
  defaultSize: { columns: number; rows: number };
  minSize: { columns: number; rows: number };
  /** Tokens the widget reads, offered for per-widget overrides in the builder. */
  tokens: readonly TokenName[];
  Component: ComponentType<WidgetProps>;
};

export function readOption<T extends OptionValue>(props: WidgetProps, key: string, fallback: T): T {
  const value = props.options[key];

  return typeof value === typeof fallback ? (value as T) : fallback;
}
