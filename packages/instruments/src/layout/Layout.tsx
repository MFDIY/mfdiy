import type { Area, Grid } from '@mfdiy/schema';

import { Box, type BoxProps } from '@mfdiy/ui/components';

/*
 * A page's grid and the areas widgets take up in it come from the document, so they can't be style
 * props. These components keep the inline styles in one place, so pages and the canvas never set
 * `style` on a Box themselves (0022).
 */

type LayoutGridProps = Omit<BoxProps<'div'>, 'display' | 'style' | 'tagName'> & {
  grid: Grid;
};

/** A page's grid of equal cells. Place children in it with `LayoutArea`. */
export function LayoutGrid({ grid, ...restProps }: LayoutGridProps) {
  return (
    <Box
      {...restProps}
      display='grid'
      style={{
        gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`
      }}
    />
  );
}

type LayoutAreaProps = Omit<BoxProps<'div'>, 'style' | 'tagName'> & {
  area: Area;
  /** Moves the area away from its cells, in pixels, e.g. while it's dragged. */
  offset?: { x: number; y: number } | null | undefined;
};

/** The cells one widget (or a marker such as a drop target) takes up in a `LayoutGrid`. */
export function LayoutArea({ area, offset, ...restProps }: LayoutAreaProps) {
  return (
    <Box
      {...restProps}
      style={{
        gridColumn: `${area.column} / span ${area.columnSpan}`,
        gridRow: `${area.row} / span ${area.rowSpan}`,
        transform: offset ? `translate(${offset.x}px, ${offset.y}px)` : undefined
      }}
    />
  );
}
