import type { SignalDefinition, TokenValues } from '@mfdiy/schema';

import { applyTokens, mfdRoot, type ResolvedInput, type WidgetManifest } from '@mfdiy/instruments';
import { Box } from '@mfdiy/ui/components';

import * as styles from './Palette.css.js';

const base = { id: 'sample', label: 'Sample', group: 'Sample' };

/** Made-up data a widget looks good with. */
function sampleInput(kind: SignalDefinition['kind'] | undefined): ResolvedInput {
  switch (kind) {
    case 'boolean':
      return { signal: { ...base, kind }, value: true };
    case 'enum':
      return { signal: { ...base, kind, options: [{ value: 'on', label: 'On' }] }, value: 'on' };
    case 'string':
      return { signal: { ...base, kind }, value: 'ABC' };
    default:
      return { signal: { ...base, kind: 'number', min: 0, max: 100, unit: '%' }, value: 64 };
  }
}

type WidgetPreviewProps = {
  manifest: WidgetManifest;
  documentTokens: TokenValues | undefined;
  pageTokens: TokenValues | undefined;
};

/** What a widget looks like on the page it's about to be added to. */
export function WidgetPreview({ manifest, documentTokens, pageTokens }: WidgetPreviewProps) {
  return (
    // Page tokens on top of the document's, as on the canvas.
    <Box className={mfdRoot} inert style={applyTokens(documentTokens)}>
      <Box className={styles.preview} style={applyTokens(pageTokens)}>
        <manifest.Component
          action={
            Object.keys(manifest.inputs).length === 0
              ? { available: true, label: manifest.label, status: 'idle', trigger: () => undefined }
              : undefined
          }
          inputs={Object.fromEntries(
            Object.entries(manifest.inputs).map(([name, { accepts }]) => [name, sampleInput(accepts[0])])
          )}
          options={{
            ...Object.fromEntries(Object.entries(manifest.options).map(([name, spec]) => [name, spec.default])),
            label: manifest.label
          }}
        />
      </Box>
    </Box>
  );
}
