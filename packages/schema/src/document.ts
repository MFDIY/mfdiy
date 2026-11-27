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
  /** How long a state is held after the value is back before it falls, in seconds (0023). */
  holdSeconds: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(60))),
  signal: IdSchema,
  thresholds: v.optional(ThresholdsSchema)
});

export type Binding = v.InferOutput<typeof BindingSchema>;

/** A page's id, unique within its profile. */
export const PageIdSchema = v.pipe(v.string(), v.minLength(1), v.maxLength(64));

/**
 * What pressing a widget does (0010): trigger a game action, by its id, or show a page of the same
 * profile, which makes the widget a page button (0018).
 */
export const WidgetActionSchema = v.union([IdSchema, v.object({ page: PageIdSchema })]);

export type WidgetActionRef = v.InferOutput<typeof WidgetActionSchema>;

export const WidgetInstanceSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  /** Widget type from the manifest registry, e.g. `light`. */
  type: IdSchema,
  /** Static, non-bound options declared by the widget manifest (e.g. its label). */
  options: v.optional(v.record(v.string(), v.union([v.string(), v.number(), v.boolean()]))),
  bindings: v.optional(v.record(v.string(), BindingSchema)),
  /** What pressing the widget does: a game action, or showing a page (0018). */
  action: v.optional(WidgetActionSchema),
  /** Per-widget theme overrides. */
  tokens: v.optional(TokenValuesSchema)
});

export type WidgetInstance = v.InferOutput<typeof WidgetInstanceSchema>;

/** The game action a widget triggers, if that's what it does. */
export function gameActionOf(widget: WidgetInstance): string | undefined {
  return typeof widget.action === 'string' ? widget.action : undefined;
}

/** The page a page button shows, if that's what it does (0018). */
export function pageActionOf(widget: WidgetInstance): string | undefined {
  return typeof widget.action === 'object' ? widget.action.page : undefined;
}

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

export const MAX_PAGE_NAME_LENGTH = 32;

export const PageSchema = v.pipe(
  v.object({
    id: PageIdSchema,
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_PAGE_NAME_LENGTH)),
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

/** Where a shared subgrid sits: the cells it covered on the page it was placed on (0026). */
export const SubgridPlaceSchema = v.pipe(
  v.object({ area: AreaSchema, grid: GridSchema }),
  v.check(
    place =>
      validateLayout({ orientation: 'any', grid: place.grid, areas: { place: place.area } }, [{ id: 'place' }])
        .length === 0,
    'A shared subgrid must lie within the grid it was placed on.'
  )
);

export type SubgridPlace = v.InferOutput<typeof SubgridPlaceSchema>;

/**
 * A grid of widgets placed once that shows on every page, in the same place, above the page's own
 * widgets (0026). It has its own columns and rows, and its widgets work as they do on a page.
 */
export const SharedSubgridSchema = v.pipe(
  v.object({
    /** Area per widget id, on its own grid. */
    areas: v.record(v.string(), AreaSchema),
    grid: GridSchema,
    id: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
    /** Kept as a share of the profile's shape, which every page has; see `subgridArea`. */
    place: SubgridPlaceSchema,
    widgets: v.array(WidgetInstanceSchema)
  }),
  v.check(
    subgrid => new Set(subgrid.widgets.map(widget => widget.id)).size === subgrid.widgets.length,
    'Widget ids must be unique within a shared subgrid.'
  ),
  v.check(
    subgrid =>
      validateLayout({ orientation: 'any', grid: subgrid.grid, areas: subgrid.areas }, subgrid.widgets).length === 0,
    'Invalid layout.'
  )
);

export type SharedSubgrid = v.InferOutput<typeof SharedSubgridSchema>;

export const MAX_DOCUMENT_NAME_LENGTH = 64;

/**
 * The shape of the screen a profile is made for, as a ratio of width to height: 16:10, or
 * 1920:1080. Only the ratio matters (0006).
 */
export const ShapeSchema = v.object({
  height: v.pipe(v.number(), v.gtValue(0), v.maxValue(100_000)),
  width: v.pipe(v.number(), v.gtValue(0), v.maxValue(100_000))
});

export type Shape = v.InferOutput<typeof ShapeSchema>;

/** Close to most tablets: Android's 16:10, between it and an iPad's 4.3:3 (0006). */
export const DEFAULT_SHAPE: Shape = { height: 10, width: 16 };

export const screenFits = ['contain', 'stretch'] as const;

/**
 * What a display does on a screen of another shape: keep the profile's shape, with bars beside or
 * above it, or stretch the pages to fill the screen (0006).
 */
export type ScreenFit = (typeof screenFits)[number];

export const MfdDocumentSchema = v.object({
  schema: v.literal(DOCUMENT_SCHEMA_VERSION),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_DOCUMENT_NAME_LENGTH)),
  /** What a display does on a screen of another shape (0006). */
  fit: v.optional(v.picklist(screenFits), 'contain'),
  /** The game whose signals and actions this document binds to. */
  game: IdSchema,
  pages: v.pipe(
    v.array(PageSchema),
    v.minLength(1),
    v.check(pages => new Set(pages.map(page => page.id)).size === pages.length, 'Page ids must be unique.')
  ),
  /** The shape the builder shows its pages in, and displays keep unless told to stretch (0006). */
  shape: v.optional(ShapeSchema, DEFAULT_SHAPE),
  /** Shown on every page, above its widgets; later ones on top (0026). */
  subgrids: v.optional(
    v.pipe(
      v.array(SharedSubgridSchema),
      v.check(
        subgrids => new Set(subgrids.map(subgrid => subgrid.id)).size === subgrids.length,
        'Shared subgrid ids must be unique.'
      )
    )
  ),
  /** Document-wide theme overrides. */
  tokens: v.optional(TokenValuesSchema)
});

export type MfdDocument = v.InferOutput<typeof MfdDocumentSchema>;
