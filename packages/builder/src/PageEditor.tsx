import type { CanvasProps } from './canvas/Canvas.js';
import type { Catalogue, NewWidget } from './palette/choices.js';
import type { Area, Cell } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';
import { addWidget, newWidgetId, placeArea } from '@mfdiy/schema';
import { Box, popoverBeside, type PopoverPosition } from '@mfdiy/ui/components';
import { useState } from 'react';

import { Canvas } from './canvas/Canvas.js';
import { widgetDefaultSize, widgetMinSize } from './canvas/widgetInfo.js';
import { Palette } from './palette/Palette.js';

export type PageEditorProps = Omit<CanvasProps, 'ghost' | 'onEmptyTap'> & {
  catalogue: Catalogue;
};

/** A widget being added. */
type Adding = { cell: Cell; position: PopoverPosition; type: string | null };

/** The canvas and everything that opens from it. Use one per page, with the page's id as its key. */
export function PageEditor({ catalogue, ...canvasProps }: PageEditorProps) {
  const { page, layout, documentTokens, onChange, onSelect } = canvasProps;
  const [adding, setAdding] = useState<Adding | null>(null);

  function place(type: string, cell: Cell): Area {
    const manifest = widgetManifests[type];

    return manifest
      ? placeArea(
          layout,
          cell,
          widgetDefaultSize(manifest, layout.grid),
          widgetMinSize({ id: '', type: manifest.type }, layout.grid)
        )
      : { ...cell, columnSpan: 1, rowSpan: 1 };
  }

  function handleEmptyTap(cell: Cell, grid: DOMRect) {
    const areas = Object.keys(widgetManifests).map(type => place(type, cell));
    const cellWidth = grid.width / layout.grid.columns;
    const cellHeight = grid.height / layout.grid.rows;
    const left = Math.min(cell.column, ...areas.map(area => area.column)) - 1;
    const right = Math.max(...areas.map(area => area.column - 1 + area.columnSpan));

    setAdding({
      cell,
      // Clear of the largest widget that could end up here, so the palette never hides or jumps.
      position: popoverBeside({
        left: grid.left + left * cellWidth,
        right: grid.left + right * cellWidth,
        top: grid.top + (cell.row - 1) * cellHeight
      }),
      type: null
    });
  }

  function handleAdd(widget: NewWidget) {
    if (!adding) {
      return;
    }

    const id = newWidgetId(page, widget.type);

    onChange(addWidget(page, layout, { id, ...widget }, place(widget.type, adding.cell)));
    onSelect(id);
    setAdding(null);
  }

  return (
    <Box containerType='size' height='full' width='full'>
      <Canvas
        {...canvasProps}
        ghost={
          adding && (adding.type ? place(adding.type, adding.cell) : { ...adding.cell, columnSpan: 1, rowSpan: 1 })
        }
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
