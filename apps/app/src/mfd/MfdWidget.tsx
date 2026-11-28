import type { WidgetInstance } from '@mfdiy/schema';

import { resolveInput, useHeldStates, widgetManifests, type ResolvedInput } from '@mfdiy/instruments';
import { gameActionOf, pageActionOf, pageOfSignal, pageSignals } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';

import { useConnection, useSignalValues, useWidgetAction } from '../telemetry/TelemetryProvider.js';

import * as styles from './MfdRenderer.css.js';
import { usePageNavigation } from './PageNavigation.js';

/** A widget connected to live data. Its position and theme tokens are up to whatever renders it. */
export function MfdWidget({ widget }: { widget: WidgetInstance }) {
  const connection = useConnection();
  const bindings = Object.entries(widget.bindings ?? {});
  const values = useSignalValues(bindings.map(([, binding]) => binding.signal));
  const gameAction = useWidgetAction(gameActionOf(widget));
  const navigation = usePageNavigation();
  const target = pageActionOf(widget);
  const targetPage = navigation.pages.find(candidate => candidate.id === target);
  const action =
    target === undefined
      ? gameAction
      : {
          available: targetPage !== undefined,
          current: target === navigation.pageId,
          label: targetPage?.name ?? 'Page',
          status: 'idle' as const,
          trigger: () => navigation.showPage(target)
        };
  const manifest = widgetManifests[widget.type];
  const resolved: Partial<Record<string, ResolvedInput>> = {};

  const shownPages = pageSignals(navigation.pages);

  bindings.forEach(([input, binding], index) => {
    const page = pageOfSignal(binding.signal);
    const signal = (page === undefined ? (connection.hello?.signals ?? []) : shownPages).find(
      candidate => candidate.id === binding.signal
    );

    if (signal) {
      resolved[input] = resolveInput(
        signal,
        page === undefined ? (values[index] ?? null) : page === navigation.pageId,
        binding
      );
    }
  });

  const states = useHeldStates(
    Object.fromEntries(
      Object.entries(resolved).map(([input, resolvedInput]) => [input, resolvedInput?.state ?? 'normal'])
    ),
    Object.fromEntries(bindings.map(([input, binding]) => [input, binding.holdSeconds]))
  );

  if (!manifest) {
    return (
      <Box alignItems='center' className={styles.unknownWidget} display='flex' height='full' justifyContent='center'>
        Unknown widget: {widget.type}
      </Box>
    );
  }

  const inputs = Object.fromEntries(
    Object.entries(resolved).map(([input, resolvedInput]) => [
      input,
      resolvedInput && { ...resolvedInput, state: states[input] ?? resolvedInput.state }
    ])
  );

  const options = Object.fromEntries(
    Object.entries(manifest.options).map(([key, spec]) => [key, widget.options?.[key] ?? spec.default])
  );

  return <manifest.Component action={manifest.actionable ? action : undefined} inputs={inputs} options={options} />;
}
