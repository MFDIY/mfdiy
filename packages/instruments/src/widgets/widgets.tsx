import { Bar } from '../primitives/Bar.js';
import { Button } from '../primitives/Button.js';
import { Light, type LightState } from '../primitives/Light.js';
import { Readout } from '../primitives/Readout.js';

import { formatValue, normalise } from './format.js';
import { readOption, type ResolvedInput, type WidgetManifest, type WidgetProps } from './manifest.js';

/*
 * Widgets connect pure primitives to data: they turn resolved inputs and options into primitive
 * props. Primitives never know about signals, bindings or the editor.
 */

function inputLabel(props: WidgetProps, input: string, fallback: string): string {
  return readOption(props, 'label', '') || props.inputs[input]?.signal.label || fallback;
}

/** On an on/off signal, lit while it's on; on a number, off while normal and amber or red as it crosses its thresholds. */
function lightState(input: ResolvedInput | undefined): LightState {
  if (input?.signal.kind === 'number') {
    return input.state === 'normal' ? 'off' : input.state;
  }

  return input?.value === true ? 'on' : 'off';
}

function LightWidget(props: WidgetProps) {
  const state = lightState(props.inputs['value']);

  return (
    <Light
      disabled={props.action ? !props.action.available : undefined}
      label={inputLabel(props, 'value', props.action?.label ?? 'Light')}
      onPress={props.action?.trigger}
      state={state}
      status={props.action?.status}
    />
  );
}

function BarWidget(props: WidgetProps) {
  const input = props.inputs['value'];
  const level = normalise(input);

  return (
    <Bar
      displayValue={level === null ? '—' : `${Math.round(level * 100)}%`}
      label={inputLabel(props, 'value', 'Bar')}
      state={input?.state ?? 'normal'}
      value={level}
    />
  );
}

function ReadoutWidget(props: WidgetProps) {
  const input = props.inputs['value'];
  const unit = input?.signal.kind === 'number' ? input.signal.unit : undefined;

  return (
    <Readout
      label={inputLabel(props, 'value', 'Readout')}
      state={input?.state ?? 'normal'}
      unit={unit}
      value={formatValue(input, readOption(props, 'decimals', 0))}
    />
  );
}

function ButtonWidget(props: WidgetProps) {
  const label = readOption(props, 'label', '') || props.action?.label || 'Button';

  return (
    <Button
      disabled={!props.action?.available}
      label={label}
      onPress={() => props.action?.trigger()}
      status={props.action?.status ?? 'idle'}
    />
  );
}

const labelOption = { label: 'Label', type: 'string', default: '' } as const;

export const lightManifest: WidgetManifest = {
  type: 'light',
  label: 'Light',
  description:
    'An annunciator light: lit by an on/off signal, or amber and red as a number crosses its thresholds. Can trigger an action when pressed.',
  inputs: { value: { label: 'Lit by', accepts: ['boolean', 'number'], required: true } },
  options: { label: labelOption },
  actionable: true,
  defaultSize: { width: 1 / 6, height: 1 / 4 },
  minSize: { columns: 1, rows: 1 },
  tokens: [
    'light.on',
    'light.on.text',
    'light.off',
    'light.off.text',
    'light.warning',
    'light.warning.text',
    'light.critical',
    'light.critical.text',
    'button.failed'
  ],
  Component: LightWidget
};

export const barManifest: WidgetManifest = {
  type: 'bar',
  label: 'Bar',
  description: 'A linear gauge for a number signal, with warning and critical thresholds.',
  inputs: { value: { label: 'Value', accepts: ['number'], required: true } },
  options: { label: labelOption },
  actionable: false,
  defaultSize: { width: 1 / 6, height: 1 / 4 },
  minSize: { columns: 1, rows: 1 },
  tokens: ['bar.fill', 'bar.fill.warning', 'bar.fill.critical', 'bar.track', 'bar.value'],
  Component: BarWidget
};

export const readoutManifest: WidgetManifest = {
  type: 'readout',
  label: 'Readout',
  description: 'Shows the value of any signal as text.',
  inputs: { value: { label: 'Value', accepts: ['number', 'boolean', 'enum', 'string'], required: true } },
  options: {
    label: labelOption,
    decimals: { label: 'Decimals', type: 'number', default: 0, min: 0, max: 3 }
  },
  actionable: false,
  defaultSize: { width: 1 / 6, height: 1 / 4 },
  minSize: { columns: 1, rows: 1 },
  tokens: ['readout.label', 'readout.value', 'readout.unit', 'status.warning', 'status.critical'],
  Component: ReadoutWidget
};

export const buttonManifest: WidgetManifest = {
  type: 'button',
  label: 'Button',
  description: 'Triggers a game action and shows whether the game accepted it.',
  inputs: {},
  options: { label: labelOption },
  actionable: true,
  defaultSize: { width: 1 / 6, height: 1 / 4 },
  minSize: { columns: 1, rows: 1 },
  tokens: ['button.face', 'button.label', 'button.outline', 'button.failed'],
  Component: ButtonWidget
};

export const widgetManifests: Record<string, WidgetManifest> = Object.fromEntries(
  [lightManifest, barManifest, readoutManifest, buttonManifest].map(manifest => [manifest.type, manifest])
);
