import * as v from 'valibot';

import { validateLayout } from './layout.js';
import { IdSchema, ThresholdsSchema } from './signals.js';
import { TokenValuesSchema } from './tokens.js';

/**
 * An MFD document: what the builder edits and the display renders. This is a first draft;
 * expect it to grow (transforms, groups, the edge-button rail). Layout rules: docs/decisions/0006.
 */
export const DOCUMENT_SCHEMA_VERSION = 2;

/** Placement on the page grid, in cells. Relative units only (see docs/decisions/0001). */
export const AreaSchema = v.object({
  column: v.pipe(v.number(), v.integer(), v.minValue(1)),
  row: v.pipe(v.number(), v.integer(), v.minValue(1)),
  columnSpan: v.pipe(v.number(), v.integer(), v.minValue(1)),
  rowSpan: v.pipe(v.number(), v.integer(), v.minValue(1))
});

export type Area = v.InferOutput<typeof AreaSchema>;

/** Connects a widget input to a signal, with its own thresholds (0023). */
export const BindingSchema = v.object({
  signal: IdSchema,
  thresholds: v.optional(ThresholdsSchema)
});

export type Binding = v.InferOutput<typeof BindingSchema>;

export const WidgetInstanceSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  /** Widget type from the manifest registry, e.g. `light`. */
  type: IdSchema,
  /** Static, non-bound options declared by the widget manifest (e.g. its label). */
  options: v.optional(v.record(v.string(), v.union([v.string(), v.number(), v.boolean()]))),
  bindings: v.optional(v.record(v.string(), BindingSchema)),
  /** Game action triggered when the widget is pressed. */
  action: v.optional(IdSchema),
  /** Per-widget theme overrides. */
  tokens: v.optional(TokenValuesSchema)
});

export type WidgetInstance = v.InferOutput<typeof WidgetInstanceSchema>;

export const MAX_GRID_SIZE = 48;

export const GridSchema = v.object({
  columns: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_GRID_SIZE)),
  rows: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_GRID_SIZE))
});

export type Grid = v.InferOutput<typeof GridSchema>;

export const layoutOrientations = ['any', 'landscape', 'portrait'] as const;

export type LayoutOrientation = (typeof layoutOrientations)[number];

/**
 * Where a page's widgets sit for one screen orientation. Widgets themselves are shared between a
 * page's layouts; only their placement differs.
 */
export const LayoutSchema = v.object({
  orientation: v.picklist(layoutOrientations),
  grid: GridSchema,
  /** Area per widget id. */
  areas: v.record(v.string(), AreaSchema)
});

export type Layout = v.InferOutput<typeof LayoutSchema>;

export const PageSchema = v.pipe(
  v.object({
    id: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(32)),
    widgets: v.array(WidgetInstanceSchema),
    /** Version 1 uses exactly one layout; orientation variants come later (0006). */
    layouts: v.pipe(v.array(LayoutSchema), v.minLength(1), v.maxLength(3)),
    /** Per-page theme overrides. */
    tokens: v.optional(TokenValuesSchema)
  }),
  v.check(
    page => new Set(page.widgets.map(widget => widget.id)).size === page.widgets.length,
    'Widget ids must be unique within a page.'
  ),
  v.check(
    page => new Set(page.layouts.map(layout => layout.orientation)).size === page.layouts.length,
    'A page can have at most one layout per orientation.'
  ),
  v.check(page => page.layouts.every(layout => validateLayout(layout, page.widgets).length === 0), 'Invalid layout.')
);

export type Page = v.InferOutput<typeof PageSchema>;

export const MAX_DOCUMENT_NAME_LENGTH = 64;

export const MfdDocumentSchema = v.object({
  schema: v.literal(DOCUMENT_SCHEMA_VERSION),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_DOCUMENT_NAME_LENGTH)),
  /** The game whose signals and actions this document binds to. */
  game: IdSchema,
  pages: v.pipe(v.array(PageSchema), v.minLength(1)),
  /** Document-wide theme overrides. */
  tokens: v.optional(TokenValuesSchema)
});

export type MfdDocument = v.InferOutput<typeof MfdDocumentSchema>;
