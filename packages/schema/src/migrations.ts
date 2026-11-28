import { isValidTokenValue, tokens, type TokenName } from './tokens.js';

/*
 * Brings themes and documents saved by an older version up to date. Each function takes what was
 * read from disk or received (unknown, unvalidated) and returns it migrated but still unvalidated:
 * parse the result with the current schema as usual. Anything it doesn't recognise is passed
 * through for the schema to reject.
 */

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/* ---------------- Themes: version 1 → 2 (0022) ---------------- */

/**
 * Where each version 1 token's value goes. Primitives come first, so that a semantic or component
 * token set in the same theme overwrites what a primitive implied (e.g. `outline` wins over the
 * `line` that `color.dim` used to imply).
 *
 * Status names changed meaning: version 1 `caution` (amber) is now `warning`, and version 1
 * `warning` (red) is now `critical`.
 */
const tokenMoves: readonly (readonly [string, readonly TokenName[]])[] = [
  ['color.background', ['neutral.1']],
  ['color.foreground', ['neutral.9']],
  // Outlines used to follow the dim colour.
  ['color.dim', ['neutral.7', 'line']],
  ['color.primary', ['primary.8']],
  ['color.off', ['primary.2']],
  ['color.caution', ['warning.8']],
  ['color.warning', ['critical.8']],
  ['font.family', ['font.text', 'font.numeric']],
  ['size.radius', ['radius']],
  ['size.border', ['border.width']],
  ['size.glow', ['glow']],
  ['motion.duration', ['duration']],

  ['surface', ['surface']],
  ['text', ['text']],
  ['text.dim', ['text.dim']],
  ['outline', ['line']],
  ['state.on', ['status.on']],
  ['state.off', ['status.off']],
  ['state.caution', ['status.warning']],
  ['state.warning', ['status.critical']],

  ['light.on', ['light.on']],
  ['light.off', ['light.off']],
  // One colour used to serve every lit state.
  ['light.text', ['light.on.text', 'light.warning.text', 'light.critical.text']],
  ['bar.fill', ['bar.fill']],
  ['bar.track', ['bar.track']],
  // The bar's value used to share the readout's colour.
  ['readout.value', ['readout.value', 'bar.value']],
  // So did the readout's unit and label.
  ['readout.label', ['readout.label', 'readout.unit']]
];

/**
 * Renames version 1 token values. Values the current contract no longer accepts (colours other
 * than hex) are dropped rather than failing the whole theme or document.
 */
export function migrateTokenValuesV1(values: unknown): unknown {
  if (!isObject(values)) {
    return values;
  }

  const migrated: Json = {};

  for (const [from, to] of tokenMoves) {
    const value = values[from];

    if (typeof value !== 'string') {
      continue;
    }

    for (const name of to) {
      if (name in tokens && isValidTokenValue(name, value)) {
        migrated[name] = value;
      }
    }
  }

  return migrated;
}

export function migrateTheme(theme: unknown): unknown {
  if (isObject(theme) && theme['schema'] === 1) {
    return { ...theme, schema: 2, tokens: migrateTokenValuesV1(theme['tokens']) };
  }

  return theme;
}

/* ---------------- Documents: version 1 → 2 (0022) ---------------- */

const litStateMoves: Record<string, string> = { caution: 'warning', warning: 'critical' };

function migrateWidgetV1(widget: unknown): unknown {
  if (!isObject(widget)) {
    return widget;
  }

  const migrated: Json = { ...widget };

  if ('tokens' in widget) {
    migrated['tokens'] = migrateTokenValuesV1(widget['tokens']);
  }

  const options = widget['options'];

  if (isObject(options)) {
    const next: Json = { ...options };

    if (widget['type'] === 'light' && typeof options['litState'] === 'string') {
      next['litState'] = litStateMoves[options['litState']] ?? options['litState'];
    }

    if (widget['type'] === 'bar') {
      delete next['cautionBelow'];
      delete next['warningBelow'];

      if ('cautionBelow' in options) {
        next['warningBelow'] = options['cautionBelow'];
      }

      if ('warningBelow' in options) {
        next['criticalBelow'] = options['warningBelow'];
      }
    }

    migrated['options'] = next;
  }

  return migrated;
}

function migratePageV1(page: unknown): unknown {
  if (!isObject(page)) {
    return page;
  }

  const migrated: Json = { ...page };

  if ('tokens' in page) {
    migrated['tokens'] = migrateTokenValuesV1(page['tokens']);
  }

  if (Array.isArray(page['widgets'])) {
    migrated['widgets'] = page['widgets'].map(migrateWidgetV1);
  }

  return migrated;
}

export function migrateDocument(document: unknown): unknown {
  if (!isObject(document) || document['schema'] !== 1) {
    return document;
  }

  const migrated: Json = { ...document, schema: 2 };

  if ('tokens' in document) {
    migrated['tokens'] = migrateTokenValuesV1(document['tokens']);
  }

  if (Array.isArray(document['pages'])) {
    migrated['pages'] = document['pages'].map(migratePageV1);
  }

  return migrated;
}
