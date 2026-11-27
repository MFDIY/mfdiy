import type { Catalogue } from '../palette/choices.js';
import type { Area, Binding, Grid, Layout, Page, WidgetActionRef, WidgetInstance } from '@mfdiy/schema';

import { acceptsSignal, type WidgetManifest } from '@mfdiy/instruments';
import { gameActionOf, scaleLayout, withArea } from '@mfdiy/schema';

import { widgetMinSize } from '../canvas/widgetInfo.js';

/** The page with one widget changed. */
export function updateWidget(page: Page, id: string, change: (widget: WidgetInstance) => WidgetInstance): Page {
  return { ...page, widgets: page.widgets.map(widget => (widget.id === id ? change(widget) : widget)) };
}

/** The widget with an input bound, or unbound with `undefined`. */
export function withBinding(widget: WidgetInstance, input: string, binding: Binding | undefined): WidgetInstance {
  const { [input]: _replaced, ...others } = widget.bindings ?? {};
  const bindings = binding ? { ...others, [input]: binding } : others;
  const { bindings: _bindings, ...rest } = widget;

  return Object.keys(bindings).length > 0 ? { ...rest, bindings } : rest;
}

/** The widget with an option set, or back to its default with `undefined`. */
export function withOption(
  widget: WidgetInstance,
  key: string,
  value: string | number | boolean | undefined
): WidgetInstance {
  const { [key]: _replaced, ...others } = widget.options ?? {};
  const options = value === undefined ? others : { ...others, [key]: value };
  const { options: _options, ...rest } = widget;

  return Object.keys(options).length > 0 ? { ...rest, options } : rest;
}

/** The widget with an action, a game action or a page to show, or none with `undefined`. */
export function withAction(widget: WidgetInstance, action: WidgetActionRef | undefined): WidgetInstance {
  const { action: _action, ...rest } = widget;

  return action ? { ...rest, action } : rest;
}

export type TypeSwap = {
  widget: WidgetInstance;
  /** What the new type can't keep, for the user to confirm, e.g. "Decimals". */
  lost: string[];
};

/**
 * The widget as another type, keeping as much as it can (0023): every option the new type has too,
 * each binding whose input the new type has and that accepts its signal, and the action if the new
 * type takes one. A signal the catalogue doesn't know is kept, as nothing says it doesn't fit.
 */
export function swapType(
  widget: WidgetInstance,
  from: WidgetManifest | undefined,
  to: WidgetManifest,
  catalogue: Catalogue
): TypeSwap {
  const lost: string[] = [];
  let next: WidgetInstance = { id: widget.id, type: to.type, ...(widget.tokens ? { tokens: widget.tokens } : {}) };

  for (const [key, value] of Object.entries(widget.options ?? {})) {
    if (to.options[key]?.type === typeof value) {
      next = withOption(next, key, value);
    } else {
      lost.push(from?.options[key]?.label ?? key);
    }
  }

  for (const [input, binding] of Object.entries(widget.bindings ?? {})) {
    const signal = catalogue.signals.find(candidate => candidate.id === binding.signal);
    const spec = to.inputs[input];

    if (spec && (!signal || acceptsSignal(spec, signal))) {
      next = withBinding(next, input, binding);
    } else {
      lost.push(`${from?.inputs[input]?.label ?? input}: ${signal?.label ?? binding.signal}`);
    }
  }

  if (widget.action) {
    if (to.actionable) {
      next = withAction(next, widget.action);
    } else {
      const id = gameActionOf(widget);
      const action = catalogue.actions.find(candidate => candidate.id === id);

      lost.push(`Action: ${action?.label ?? id ?? 'Show a page'}`);
    }
  }

  return { widget: next, lost };
}

/** The page on a grid of another size, its widgets scaled to the same share of it (0006). */
export function resizeGrid(page: Page, layout: Layout, grid: Grid): Page {
  const minSizes = Object.fromEntries(page.widgets.map(widget => [widget.id, widgetMinSize(widget, grid)]));

  return {
    ...page,
    layouts: page.layouts.map(other => (other === layout ? scaleLayout(other, grid, minSizes) : other))
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * The page with a widget at `area`, kept on the grid and at least its minimum size: a size that
 * doesn't fit where the widget is moves it back, as typing a width shouldn't push it off the page.
 */
export function placeWidget(page: Page, layout: Layout, id: string, area: Area): Page {
  const widget = page.widgets.find(candidate => candidate.id === id);
  const { grid } = layout;
  const min = widget ? widgetMinSize(widget, grid) : { columns: 1, rows: 1 };
  const columnSpan = clamp(area.columnSpan, min.columns, grid.columns);
  const rowSpan = clamp(area.rowSpan, min.rows, grid.rows);
  const placed = {
    column: clamp(area.column, 1, grid.columns - columnSpan + 1),
    row: clamp(area.row, 1, grid.rows - rowSpan + 1),
    columnSpan,
    rowSpan
  };

  return {
    ...page,
    layouts: page.layouts.map(other => (other === layout ? withArea(other, id, placed) : other))
  };
}
