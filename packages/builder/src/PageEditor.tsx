import type { CanvasPointer, CanvasProps } from './canvas/Canvas.js';
import type { Catalogue, NewWidget } from './palette/choices.js';
import type { Area, GridPoint } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';
import { addWidget, growArea, newWidgetId, placeArea } from '@mfdiy/schema';
import { Box, SearchList, Sheet, useToast } from '@mfdiy/ui/components';
import { useMatchesMediaQuery } from '@mfdiy/ui/hooks';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

import { Canvas } from './canvas/Canvas.js';
import { widgetDefaultSize, widgetMinSize } from './canvas/widgetInfo.js';
import { DragLabel } from './palette/DragLabel.js';
import { useWidgetLibrary, type LibraryEntry } from './palette/useWidgetLibrary.js';

export type PageEditorProps = Omit<CanvasProps, 'ghost' | 'newWidgetArea' | 'onEmptyTap' | 'pointerRef'> & {
  catalogue: Catalogue;
};

/** A row being dragged out of the library. */
type Drag = {
  pointerId: number;
  entry: LibraryEntry;
  label: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  /** Whether the press has become a drag. */
  dragging: boolean;
  /** The grid point under the pointer, if it's over the canvas. */
  point: GridPoint | null;
};

/** How far the pointer travels, in pixels, before a press on a row becomes a drag. */
const DRAG_THRESHOLD = 4;

/** After this many clicks that can't add anything, the library explains itself. */
const CLICKS_BEFORE_HINT = 2;

const HINT = 'Tap a cell, or drag a widget onto the page.';

/**
 * The canvas and the widget library (0006, 0008). A widget is added where a cell was marked, or where
 * it's dropped; never somewhere guessed. With a mouse or pen on a wide screen the library is a
 * sidebar to drag from; otherwise it's a sheet that opens when a cell is tapped. Use one per page,
 * with the page's id as its key.
 */
export function PageEditor({ catalogue, ...canvasProps }: PageEditorProps) {
  const { page, layout, documentTokens, onChange, onSelect } = canvasProps;
  const [marked, setMarked] = useState<GridPoint | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const canvasRef = useRef<CanvasPointer>(null);
  /** A drag that ends on its own row also clicks it; that click mustn't count. */
  const justDraggedRef = useRef(false);
  const idleClicksRef = useRef(0);

  const toast = useToast();
  const library = useWidgetLibrary({ catalogue, documentTokens, pageTokens: page.tokens });
  const hasFinePointer = useMatchesMediaQuery('(any-pointer: fine)');
  const isWide = useMatchesMediaQuery('(min-width: 900px)');
  const sidebar = hasFinePointer && isWide;

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

  function add(widget: NewWidget, point: GridPoint) {
    const id = newWidgetId(page, widget.type);

    onChange(addWidget(page, layout, { id, ...widget }, place(widget.type, point)));
    onSelect(id);
    setMarked(null);
    setSheetOpen(false);
    library.reset();
  }

  function setDragState(next: Drag | null) {
    dragRef.current = next;
    setDrag(next);
  }

  function handleEmptyTap(point: GridPoint) {
    setMarked(point);
    setSheetOpen(true);
  }

  function handleSelect(widgetId: string | null) {
    // Selecting a widget lets go of the marked cell; on a phone, its properties take the sheet's place.
    if (widgetId !== null) {
      setMarked(null);
      setSheetOpen(false);
    }

    onSelect(widgetId);
  }

  function handleLibrarySelect(id: string) {
    const entry = library.entry(id);

    if (justDraggedRef.current || !entry) {
      justDraggedRef.current = false;

      return;
    }

    if (!entry.widget) {
      library.pick(entry.manifest);

      return;
    }

    if (marked) {
      add(entry.widget, marked);

      return;
    }

    idleClicksRef.current += 1;

    if (idleClicksRef.current >= CLICKS_BEFORE_HINT) {
      idleClicksRef.current = 0;
      toast.show(HINT, { dismissible: true });
    }
  }

  function handleItemPointerDown(id: string, event: PointerEvent<HTMLElement>) {
    const entry = library.entry(id);
    const label = library.listProps.groups.flatMap(group => group.items).find(item => item.id === id)?.label;

    // Fingers scroll the list; only a mouse or pen drags out of it (0008).
    if (!entry || !label || event.pointerType === 'touch' || event.button !== 0) {
      return;
    }

    setDragState({
      pointerId: event.pointerId,
      entry,
      label: entry.widget ? label : entry.manifest.label,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      dragging: false,
      point: null
    });
  }

  function handleDragEnd(current: Drag) {
    setDragState(null);

    if (!current.dragging) {
      return;
    }

    justDraggedRef.current = true;
    // The click that follows a drag, if any, comes straight away; any later one is a real click.
    setTimeout(() => {
      justDraggedRef.current = false;
    });

    if (!current.point) {
      return;
    }

    if (current.entry.widget) {
      add(current.entry.widget, current.point);
    } else {
      // Not connected yet (0006): the drop marks the spot, and the library moves on to its data.
      setMarked(current.point);
      library.pick(current.entry.manifest);
    }
  }

  const dragPointerId = drag?.pointerId ?? null;
  const isDragging = drag?.dragging ?? false;

  // The pointer leaves the library while dragging, so the window follows it.
  useEffect(() => {
    if (dragPointerId === null) {
      return;
    }

    function handleMove(event: globalThis.PointerEvent) {
      const current = dragRef.current;

      if (!current || event.pointerId !== current.pointerId) {
        return;
      }

      const dragging =
        current.dragging ||
        Math.hypot(event.clientX - current.startX, event.clientY - current.startY) >= DRAG_THRESHOLD;

      setDragState({
        ...current,
        dragging,
        x: event.clientX,
        y: event.clientY,
        point: dragging ? (canvasRef.current?.gridPointAt(event.clientX, event.clientY) ?? null) : null
      });
    }

    function handleUp(event: globalThis.PointerEvent) {
      const current = dragRef.current;

      if (current && event.pointerId === current.pointerId) {
        handleDragEnd(current);
      }
    }

    function handleCancel() {
      setDragState(null);
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
    };
    // Only (re)subscribe per drag: the handlers read the latest state from the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragPointerId]);

  // The grabbing hand follows the pointer everywhere while dragging, not only over the row.
  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const root = document.documentElement;
    const previous = root.style.cursor;

    root.style.cursor = 'grabbing';

    return () => {
      root.style.cursor = previous;
    };
  }, [isDragging]);

  const dropzone = drag?.dragging && drag.point ? place(drag.entry.manifest.type, drag.point) : null;
  const ghost =
    dropzone ??
    (marked
      ? library.highlightedType
        ? place(library.highlightedType, marked)
        : library.picked
          ? place(library.picked.type, marked)
          : smallestPlace(marked)
      : null);

  const libraryList = (
    <SearchList
      {...library.listProps}
      draggable={sidebar && !marked}
      onItemPointerDown={sidebar ? handleItemPointerDown : undefined}
      onSelect={handleLibrarySelect}
    />
  );

  return (
    <Box display='flex' gap='4x' height='full' width='full'>
      {sidebar ? (
        <Box flexShrink='0' height='full' minHeight='none' tagName='aside' width='panel'>
          {libraryList}
        </Box>
      ) : null}
      <Box containerType='size' flexGrow='1' height='full' minWidth='none'>
        <Canvas
          {...canvasProps}
          ghost={ghost}
          newWidgetArea={smallestPlace}
          onEmptyTap={handleEmptyTap}
          onSelect={handleSelect}
          pointerRef={canvasRef}
        />
      </Box>
      {sidebar ? null : (
        <Sheet
          onClose={() => {
            setSheetOpen(false);
            setMarked(null);
            library.reset();
          }}
          open={sheetOpen}
          title='Add a widget'
        >
          {libraryList}
        </Sheet>
      )}
      {drag?.dragging ? <DragLabel label={drag.label} x={drag.x} y={drag.y} /> : null}
    </Box>
  );
}
