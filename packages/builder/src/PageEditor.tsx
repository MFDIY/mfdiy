import type { CanvasProps } from './canvas/Canvas.js';
import type { Catalogue, NewWidget } from './palette/choices.js';
import type { Area, GridPoint } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';
import { addWidget, newWidgetId, placeArea } from '@mfdiy/schema';
import { Box, popoverBeside, type PopoverPosition } from '@mfdiy/ui/components';
import { useState } from 'react';

import { Canvas } from './canvas/Canvas.js';
import { widgetDefaultSize, widgetMinSize } from './canvas/widgetInfo.js';
import { Palette } from './palette/Palette.js';

export type PageEditorProps = Omit<CanvasProps, 'ghost' | 'newWidgetArea' | 'onEmptyTap'> & {
  catalogue: Catalogue;
};

/** A widget being added. */
type Adding = { point: GridPoint; position: PopoverPosition; type: string | null };

/** The canvas and everything that opens from it. Use one per page, with the page's id as its key. */
export function PageEditor({ catalogue, ...canvasProps }: PageEditorProps) {
  const { page, layout, documentTokens, onChange, onSelect } = canvasProps;
  const [adding, setAdding] = useState<Adding | null>(null);

  /** What every widget covers at least, before one is picked: the smallest of their default sizes. */
  function smallestPlace(point: GridPoint): Area {
    const sizes = Object.values(widgetManifests).map(manifest => widgetDefaultSize(manifest, layout.grid));

    return placeArea(layout, point, {
      columns: Math.min(...sizes.map(size => size.columns)),
      rows: Math.min(...sizes.map(size => size.rows))
    });
  }

  function place(type: string, point: GridPoint): Area {
    const around = smallestPlace(point);
    const manifest = widgetManifests[type];

    return manifest
      ? placeArea(layout, point, widgetDefaultSize(manifest, layout.grid), {
          around,
          minSize: widgetMinSize({ id: '', type }, layout.grid)
        })
      : around;
  }

  function handleEmptyTap(point: GridPoint, grid: DOMRect) {
    const areas = Object.keys(widgetManifests).map(type => place(type, point));
    const cellWidth = grid.width / layout.grid.columns;
    const cellHeight = grid.height / layout.grid.rows;

    setAdding({
      point,
      // Clear of the largest widget that could end up here, so the palette never hides or jumps.
      position: popoverBeside({
        left: grid.left + Math.min(...areas.map(area => area.column - 1)) * cellWidth,
        right: grid.left + Math.max(...areas.map(area => area.column - 1 + area.columnSpan)) * cellWidth,
        top: grid.top + Math.min(...areas.map(area => area.row - 1)) * cellHeight
      }),
      type: null
    });
  }

  function handleAdd(widget: NewWidget) {
    if (!adding) {
      return;
    }

    const id = newWidgetId(page, widget.type);

    onChange(addWidget(page, layout, { id, ...widget }, place(widget.type, adding.point)));
    onSelect(id);
    setAdding(null);
  }

  return (
    <Box containerType='size' height='full' width='full'>
      <Canvas
        {...canvasProps}
        ghost={adding && (adding.type ? place(adding.type, adding.point) : smallestPlace(adding.point))}
        newWidgetArea={smallestPlace}
        onEmptyTap={handleEmptyTap}
      />
      {adding ? (
        <Palette
          catalogue={catalogue}
          documentTokens={documentTokens}
          onAdd={handleAdd}
          onClose={() => setAdding(null)}
          onTypeChange={type => setAdding({ ...adding, type })}
          pageTokens={page.tokens}
          position={adding.position}
          type={adding.type}
        />
      ) : null}
    </Box>
  );
}
