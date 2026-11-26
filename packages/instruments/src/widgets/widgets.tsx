import { Bar, type BarState } from '../primitives/Bar.js';
import { Button } from '../primitives/Button.js';
import { Light, type LightState } from '../primitives/Light.js';
import { Readout } from '../primitives/Readout.js';

import { formatValue, normalise } from './format.js';
import { readOption, type WidgetManifest, type WidgetProps } from './manifest.js';

/*
 * Widgets connect pure primitives to data: they turn resolved inputs and options into primitive
 * props. Primitives never know about signals, bindings or the editor.
 */

function inputLabel(props: WidgetProps, input: string, fallback: string): string {
  return readOption(props, 'label', '') || props.inputs[input]?.signal.label || fallback;
}

function LightWidget(props: WidgetProps) {
  const lit = props.inputs['value']?.value;
  const litState = readOption<string>(props, 'litState', 'on');
  const state: LightState =
    lit === true ? (litState === 'warning' || litState === 'critical' ? litState : 'on') : 'off';
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
  const level = normalise(props.inputs['value']);
  const warningBelow = readOption(props, 'warningBelow', 0.25);
  const criticalBelow = readOption(props, 'criticalBelow', 0.1);
  const state: BarState =
    level === null ? 'normal' : level < criticalBelow ? 'critical' : level < warningBelow ? 'warning' : 'normal';

  return (
    <Bar
      displayValue={level === null ? '—' : `${Math.round(level * 100)}%`}
      label={inputLabel(props, 'value', 'Bar')}
      state={state}
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
  description: 'An annunciator light for an on/off signal. Can trigger an action when pressed.',
  inputs: { value: { label: 'Lit when', accepts: ['boolean'], required: true } },
  options: {
    label: labelOption,
    litState: { label: 'Colour when lit (on, warning, critical)', type: 'string', default: 'on' }
  },
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
  options: {
    label: labelOption,
    warningBelow: { label: 'Warning below', type: 'number', default: 0.25, min: 0, max: 1 },
    criticalBelow: { label: 'Critical below', type: 'number', default: 0.1, min: 0, max: 1 }
  },
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
  tokens: ['readout.label', 'readout.value', 'readout.unit'],
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
