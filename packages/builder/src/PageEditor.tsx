import type { CanvasProps } from './canvas/Canvas.js';
import type { Catalogue, NewWidget } from './palette/choices.js';
import type { Area, GridPoint } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';
import { addWidget, growArea, newWidgetId, placeArea } from '@mfdiy/schema';
import { Box, CommandPalette } from '@mfdiy/ui/components';
import { useState } from 'react';

import { Canvas } from './canvas/Canvas.js';
import { widgetDefaultSize, widgetMinSize } from './canvas/widgetInfo.js';
import { useWidgetPalette } from './palette/useWidgetPalette.js';

export type PageEditorProps = Omit<CanvasProps, 'ghost' | 'newWidgetArea' | 'onEmptyTap'> & {
  catalogue: Catalogue;
};

/** A widget being added. Kept while the palette closes, so it can do so unchanged. */
type Adding = {
  isOpen: boolean;
  point: GridPoint;
  byTouch: boolean;
};

/** The canvas and everything that opens from it. Use one per page, with the page's id as its key. */
export function PageEditor({ catalogue, ...canvasProps }: PageEditorProps) {
  const { page, layout, documentTokens, onChange, onSelect } = canvasProps;
  const [adding, setAdding] = useState<Adding | null>(null);

  const palette = useWidgetPalette({ catalogue, documentTokens, onAdd: handleAdd, pageTokens: page.tokens });

  /** What every widget covers at least, before one is picked: the smallest of their default sizes. */
  function smallestPlace(point: GridPoint): Area {
    const sizes = Object.values(widgetManifests).map(manifest => widgetDefaultSize(manifest, layout.grid));

    return placeArea(layout, point, {
      columns: Math.min(...sizes.map(size => size.columns)),
      rows: Math.min(...sizes.map(size => size.rows))
    });
  }

  function place(type: string, point: GridPoint): Area {
    const smallest = smallestPlace(point);
    const manifest = widgetManifests[type];

    return manifest
      ? growArea(
          layout,
          smallest,
          widgetDefaultSize(manifest, layout.grid),
          widgetMinSize({ id: '', type }, layout.grid)
        )
      : smallest;
  }

  function handleEmptyTap(point: GridPoint, pointerType: string) {
    palette.reset();
    setAdding({ isOpen: true, point, byTouch: pointerType === 'touch' });
  }

  function handleClose() {
    setAdding(current => current && { ...current, isOpen: false });
  }

  function handleAdd(widget: NewWidget) {
    if (!adding) {
      return;
    }

    const id = newWidgetId(page, widget.type);

    onChange(addWidget(page, layout, { id, ...widget }, place(widget.type, adding.point)));
    onSelect(id);
  }

  const ghost = adding?.isOpen
    ? palette.type
      ? place(palette.type, adding.point)
      : smallestPlace(adding.point)
    : null;

  return (
    <Box containerType='size' height='full' width='full'>
      <Canvas {...canvasProps} ghost={ghost} newWidgetArea={smallestPlace} onEmptyTap={handleEmptyTap} />
      {adding ? (
        <CommandPalette
          {...palette.paletteProps}
          focusSearch={!adding.byTouch}
          isOpen={adding.isOpen}
          onClose={handleClose}
        />
      ) : null}
    </Box>
  );
}
