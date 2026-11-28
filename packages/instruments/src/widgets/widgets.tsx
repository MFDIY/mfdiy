import type { ReactElement } from 'react';

import { Bar } from '../primitives/Bar.js';
import { CornerBox } from '../primitives/CornerBox.js';
import { Label } from '../primitives/Label.js';
import { Light, type LightState } from '../primitives/Light.js';
import { Pressable } from '../primitives/Pressable.js';
import { Readout } from '../primitives/Readout.js';

import { formatNumber, formatValue, normalise } from './format.js';
import { readOption, type ResolvedInput, type WidgetManifest, type WidgetProps } from './manifest.js';

/*
 * Widgets connect pure primitives to data: they turn resolved inputs and options into primitive
 * props. Primitives never know about signals, bindings or the editor.
 */

function inputLabel(props: WidgetProps, input: string, fallback: string): string {
  return readOption(props, 'label', '') || props.inputs[input]?.signal.label || fallback;
}

/** Any widget with an action can be pressed; every widget keeps the room for its corners (0018). */
function pressable(props: WidgetProps, content: ReactElement): ReactElement {
  const { action } = props;

  return action ? (
    <Pressable current={action.current} disabled={!action.available} onPress={action.trigger} status={action.status}>
      {content}
    </Pressable>
  ) : (
    <CornerBox>{content}</CornerBox>
  );
}

/** On an on/off signal, lit while it's on; on a number, off while normal and amber or red as it crosses its thresholds. */
function lightState(input: ResolvedInput | undefined): LightState {
  if (input?.signal.kind === 'number') {
    return input.state === 'normal' ? 'off' : input.state;
  }

  return input?.value === true ? 'on' : 'off';
}

function LightWidget(props: WidgetProps) {
  return pressable(
    props,
    <Light
      label={inputLabel(props, 'value', props.action?.label ?? 'Light')}
      state={lightState(props.inputs['value'])}
    />
  );
}

function BarWidget(props: WidgetProps) {
  const input = props.inputs['value'];
  const level = normalise(input);

  return pressable(
    props,
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
  const decimals = readOption(props, 'decimals', 0);

  return pressable(
    props,
    <Readout
      label={inputLabel(props, 'value', 'Readout')}
      state={input?.state ?? 'normal'}
      unit={unit}
      value={
        typeof input?.value === 'number'
          ? formatNumber(input.value, { decimals, digits: readOption(props, 'digits', 0) })
          : formatValue(input, decimals)
      }
    />
  );
}

function LabelWidget(props: WidgetProps) {
  return pressable(props, <Label text={readOption(props, 'label', '') || props.action?.label || 'Label'} />);
}

const labelOption = { label: 'Label', type: 'string', default: '' } as const;

const pressTokens = ['press.cue', 'press.accepted', 'press.pending', 'press.failed'] as const;

export const lightManifest: WidgetManifest = {
  type: 'light',
  label: 'Light',
  description: 'An annunciator light: lit by an on/off signal, or amber and red as a number crosses its thresholds.',
  inputs: { value: { label: 'Lit by', accepts: ['boolean', 'number'], pageShown: true, required: true } },
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
    ...pressTokens
  ],
  Component: LightWidget
};

export const barManifest: WidgetManifest = {
  type: 'bar',
  label: 'Bar',
  description: 'A linear gauge for a number signal, with warning and critical thresholds.',
  inputs: { value: { label: 'Value', accepts: ['number'], bounded: true, required: true } },
  options: { label: labelOption },
  actionable: true,
  defaultSize: { width: 1 / 6, height: 1 / 4 },
  minSize: { columns: 1, rows: 1 },
  tokens: ['bar.fill', 'bar.fill.warning', 'bar.fill.critical', 'bar.track', 'bar.value', ...pressTokens],
  Component: BarWidget
};

export const readoutManifest: WidgetManifest = {
  type: 'readout',
  label: 'Readout',
  description: 'Shows the value of any signal as text.',
  inputs: { value: { label: 'Value', accepts: ['number', 'boolean', 'enum', 'string'], required: true } },
  options: {
    label: labelOption,
    decimals: { label: 'Decimals', type: 'number', default: 0, min: 0, max: 3 },
    digits: { label: 'Pad to digits', type: 'number', default: 0, min: 0, max: 9 }
  },
  actionable: true,
  defaultSize: { width: 1 / 6, height: 1 / 4 },
  minSize: { columns: 1, rows: 1 },
  tokens: [
    'readout.label',
    'readout.value',
    'readout.unit',
    'readout.zeros',
    'status.warning',
    'status.critical',
    ...pressTokens
  ],
  Component: ReadoutWidget
};

export const labelManifest: WidgetManifest = {
  type: 'label',
  label: 'Label',
  description: 'Static text. Given an action, it makes a button, such as one that shows another page.',
  inputs: {},
  options: { label: labelOption },
  actionable: true,
  defaultSize: { width: 1 / 6, height: 1 / 4 },
  minSize: { columns: 1, rows: 1 },
  tokens: ['text', ...pressTokens],
  Component: LabelWidget
};

export const widgetManifests: Record<string, WidgetManifest> = Object.fromEntries(
  [lightManifest, barManifest, readoutManifest, labelManifest].map(manifest => [manifest.type, manifest])
);
