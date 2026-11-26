import { applyTokens, mfdRoot, resolveInput, type ResolvedInput, type WidgetManifest } from '@mfdiy/instruments';
import { bindingFor, type SignalDefinition, type TokenValues } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';

import * as styles from './WidgetPreview.css.js';

const sample: SignalDefinition = {
  id: 'sample',
  label: 'Sample',
  group: 'Sample',
  kind: 'number',
  min: 0,
  max: 100,
  unit: '%'
};

/** A made-up value that a widget looks good with. */
function sampleValue(signal: SignalDefinition): ResolvedInput['value'] {
  switch (signal.kind) {
    case 'boolean':
      return true;
    case 'enum':
      return signal.options[0]?.value ?? null;
    case 'string':
      return 'ABC';
    case 'number':
      return Math.round(signal.min + (signal.max - signal.min) * 0.64);
  }
}

type WidgetPreviewProps = {
  documentTokens: TokenValues | undefined;
  /** Replaces the widget's own name. */
  label?: string | undefined;
  manifest: WidgetManifest;
  pageTokens: TokenValues | undefined;
  /** What to show; made up unless given. */
  signal?: SignalDefinition | undefined;
};

/** What a widget looks like on the page it's about to be added to. */
export function WidgetPreview({ documentTokens, label, manifest, pageTokens, signal }: WidgetPreviewProps) {
  const inputs = Object.entries(manifest.inputs).map(([name, { accepts }]): [string, ResolvedInput] => {
    const shown: SignalDefinition = signal ?? (accepts.includes('number') ? sample : { ...sample, kind: 'boolean' });

    return [name, resolveInput(shown, sampleValue(shown), bindingFor(shown))];
  });

  return (
    // Page tokens on top of the document's, as on the canvas.
    <Box className={mfdRoot} cssVariables={applyTokens(documentTokens)} height='full'>
      <Box className={styles.surface} cssVariables={applyTokens(pageTokens)} height='full'>
        <manifest.Component
          action={
            inputs.length === 0
              ? { available: true, label: label ?? manifest.label, status: 'idle', trigger: () => undefined }
              : undefined
          }
          inputs={Object.fromEntries(inputs)}
          options={{
            ...Object.fromEntries(Object.entries(manifest.options).map(([name, spec]) => [name, spec.default])),
            label: label ?? manifest.label
          }}
        />
      </Box>
    </Box>
  );
}
