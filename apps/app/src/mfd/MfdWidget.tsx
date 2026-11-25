import type { WidgetInstance } from '@mfdiy/schema';

import { widgetManifests, type ResolvedInput } from '@mfdiy/instruments';

import { useConnection, useSignalValues, useWidgetAction } from '../telemetry/TelemetryProvider.js';

import * as styles from './MfdRenderer.css.js';

/** A widget connected to live data. Its position and theme tokens are up to whatever renders it. */
export function MfdWidget({ widget }: { widget: WidgetInstance }) {
  const connection = useConnection();
  const bindings = Object.entries(widget.bindings ?? {});
  const values = useSignalValues(bindings.map(([, binding]) => binding.signal));
  const action = useWidgetAction(widget.action);
  const manifest = widgetManifests[widget.type];

  if (!manifest) {
    return <div className={styles.unknownWidget}>Unknown widget: {widget.type}</div>;
  }

  const inputs: Partial<Record<string, ResolvedInput>> = {};

  bindings.forEach(([input, binding], index) => {
    const signal = connection.hello?.signals.find(candidate => candidate.id === binding.signal);

    if (signal) {
      inputs[input] = { signal, value: values[index] ?? null };
    }
  });

  const options = Object.fromEntries(
    Object.entries(manifest.options).map(([key, spec]) => [key, widget.options?.[key] ?? spec.default])
  );

  return <manifest.Component action={manifest.actionable ? action : undefined} inputs={inputs} options={options} />;
}
