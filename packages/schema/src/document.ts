import * as v from 'valibot';

import { IdSchema } from './signals.js';
import { TokenValuesSchema } from './tokens.js';

/**
 * An MFD document: what the builder edits and the display renders. This is a first draft;
 * expect it to grow (transforms, groups, the edge-button rail, layouts per screen shape).
 */
export const DOCUMENT_SCHEMA_VERSION = 1;

/** Placement on the page grid, in cells. Relative units only (see docs/decisions/0001). */
export const AreaSchema = v.object({
  column: v.pipe(v.number(), v.integer(), v.minValue(1)),
  row: v.pipe(v.number(), v.integer(), v.minValue(1)),
  columnSpan: v.pipe(v.number(), v.integer(), v.minValue(1)),
  rowSpan: v.pipe(v.number(), v.integer(), v.minValue(1))
});

export type Area = v.InferOutput<typeof AreaSchema>;

/** Connects a widget input to a signal. */
export const BindingSchema = v.object({
  signal: IdSchema
});

export type Binding = v.InferOutput<typeof BindingSchema>;

export const WidgetInstanceSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  /** Widget type from the manifest registry, e.g. `light`. */
  type: IdSchema,
  area: AreaSchema,
  /** Static, non-bound options declared by the widget manifest (e.g. its label). */
  options: v.optional(v.record(v.string(), v.union([v.string(), v.number(), v.boolean()]))),
  bindings: v.optional(v.record(v.string(), BindingSchema)),
  /** Game action triggered when the widget is pressed. */
  action: v.optional(IdSchema),
  /** Per-widget theme overrides. */
  tokens: v.optional(TokenValuesSchema)
});

export type WidgetInstance = v.InferOutput<typeof WidgetInstanceSchema>;

export const PageSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(32)),
  grid: v.object({
    columns: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(24)),
    rows: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(24))
  }),
  widgets: v.array(WidgetInstanceSchema),
  /** Per-page theme overrides. */
  tokens: v.optional(TokenValuesSchema)
});

export type Page = v.InferOutput<typeof PageSchema>;

export const MfdDocumentSchema = v.object({
  schema: v.literal(DOCUMENT_SCHEMA_VERSION),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  /** The game whose signals and actions this document binds to. */
  game: IdSchema,
  pages: v.pipe(v.array(PageSchema), v.minLength(1)),
  /** Document-wide theme overrides. */
  tokens: v.optional(TokenValuesSchema)
});

export type MfdDocument = v.InferOutput<typeof MfdDocumentSchema>;
