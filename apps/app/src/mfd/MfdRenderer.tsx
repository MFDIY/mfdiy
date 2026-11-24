import type { Area, MfdDocument, WidgetInstance } from '@mfdiy/schema';

import { applyTokens, mfdRoot, widgetManifests, type ResolvedInput } from '@mfdiy/instruments';
import { selectLayout } from '@mfdiy/schema';
import { useMatchesMediaQuery } from '@mfdiy/ui/hooks';

import { useConnection, useSignalValues, useWidgetAction } from '../telemetry/TelemetryProvider.js';

import * as styles from './MfdRenderer.css.js';

type MfdRendererProps = {
  document: MfdDocument;
  pageId: string;
  onPageChange: (pageId: string) => void;
};

/**
 * Renders an MFD document: theme tokens cascade document → page → widget, and each widget
 * subscribes only to the signals it is bound to.
 */
export function MfdRenderer({ document, pageId, onPageChange }: MfdRendererProps) {
  const page = document.pages.find(candidate => candidate.id === pageId) ?? document.pages[0];
  const portrait = useMatchesMediaQuery('(orientation: portrait)');

  if (!page) {
    return null;
  }

  const layout = selectLayout(page, portrait ? 'portrait' : 'landscape');

  return (
    <div className={`${mfdRoot} ${styles.screen}`} style={applyTokens(document.tokens)}>
      <div
        className={styles.page}
        style={{
          ...applyTokens(page.tokens),
          gridTemplateColumns: `repeat(${layout.grid.columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.grid.rows}, minmax(0, 1fr))`
        }}
      >
        {page.widgets.map(widget => {
          const area = layout.areas[widget.id];

          return area ? <WidgetSlot area={area} key={widget.id} widget={widget} /> : null;
        })}
      </div>
      {document.pages.length > 1 ? (
        <nav className={styles.tabs} style={applyTokens(page.tokens)}>
          {document.pages.map(candidate => (
            <button
              aria-current={candidate.id === page.id ? 'page' : undefined}
              className={styles.tab}
              key={candidate.id}
              onClick={() => onPageChange(candidate.id)}
              type='button'
            >
              {candidate.name}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

function WidgetSlot({ area, widget }: { area: Area; widget: WidgetInstance }) {
  const connection = useConnection();
  const bindings = Object.entries(widget.bindings ?? {});
  const values = useSignalValues(bindings.map(([, binding]) => binding.signal));
  const action = useWidgetAction(widget.action);
  const manifest = widgetManifests[widget.type];

  const style = {
    ...applyTokens(widget.tokens),
    gridColumn: `${area.column} / span ${area.columnSpan}`,
    gridRow: `${area.row} / span ${area.rowSpan}`,
    minHeight: 0,
    minWidth: 0
  };

  if (!manifest) {
    return (
      <div className={styles.unknownWidget} style={style}>
        Unknown widget: {widget.type}
      </div>
    );
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

  return (
    <div style={style}>
      <manifest.Component action={manifest.actionable ? action : undefined} inputs={inputs} options={options} />
    </div>
  );
}
