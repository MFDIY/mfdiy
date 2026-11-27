import type { CanvasPointer, CanvasProps } from './canvas/Canvas.js';
import type { Catalogue } from './palette/choices.js';
import type { Area, GridPoint, Page } from '@mfdiy/schema';

import { widgetManifests, type WidgetManifest } from '@mfdiy/instruments';
import { addWidget, growArea, newWidgetId, placeArea } from '@mfdiy/schema';
import {
  Box,
  PanelLayout,
  SearchList,
  usePanelForm,
  useToast,
  type PanelSide,
  type SearchListProps
} from '@mfdiy/ui/components';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

import { Canvas } from './canvas/Canvas.js';
import { widgetDefaultSize, widgetMinSize } from './canvas/widgetInfo.js';
import { DragLabel } from './palette/DragLabel.js';
import { useWidgetLibrary } from './palette/useWidgetLibrary.js';
import { PropertiesPanel } from './properties/PropertiesPanel.js';
import { propertiesTitle } from './properties/title.js';

export type PageEditorProps = Omit<
  CanvasProps,
  'ghost' | 'newWidgetArea' | 'onChange' | 'onDragChange' | 'onEmptyTap' | 'pointerRef'
> & {
  catalogue: Catalogue;
  /**
   * Opens the page's properties with its name field focused when the editor is shown, e.g. on a page
   * just duplicated (0023).
   */
  focusPageName?: boolean | undefined;
  /** `merge` names a run of typing in one field; changes with the same one are one undo step (0023). */
  onChange: (page: Page, merge?: string) => void;
  /** Deletes the page; greyed out without it, as on a profile's last page. */
  onDeletePage?: (() => void) | undefined;
  /** Duplicates the page; greyed out without it. */
  onDuplicatePage?: (() => void) | undefined;
};

/** A row being dragged out of the library. */
type Drag = {
  pointerId: number;
  manifest: WidgetManifest;
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
 * The canvas between the widget library and the properties panel (0006, 0008), laid out by
 * PanelLayout. A widget is added where a cell was marked, or where it's dropped; never somewhere
 * guessed. As sidebars, the library is there to drag from; as sheets, it opens when a cell is
 * tapped. The properties panel (0023) shows the selected widget, or the page; as a sheet, it peeks
 * while a widget is moved or resized. Use one per page, with the page's id as its key.
 */
export function PageEditor({
  catalogue,
  focusPageName = false,
  onDeletePage,
  onDuplicatePage,
  ...canvasProps
}: PageEditorProps) {
  const { page, layout, documentTokens, onChange, onSelect, selectedId } = canvasProps;
  const [marked, setMarked] = useState<GridPoint | null>(null);
  const [openSheet, setOpenSheet] = useState<PanelSide | null>(focusPageName ? 'end' : null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [widgetDragging, setWidgetDragging] = useState(false);
  const dragRef = useRef<Drag | null>(null);
  const canvasRef = useRef<CanvasPointer>(null);
  /** A drag that ends on its own row also clicks it; that click mustn't count. */
  const justDraggedRef = useRef(false);
  const idleClicksRef = useRef(0);

  const toast = useToast();
  const library = useWidgetLibrary({ documentTokens, pageTokens: page.tokens });

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

  /** Adds a widget of a type, without data yet (0006); its properties ask for that next. */
  function add(type: string, point: GridPoint) {
    const id = newWidgetId(page, type);

    onChange(addWidget(page, layout, { id, type }, place(type, point)));
    handleSelect(id);
  }

  function setDragState(next: Drag | null) {
    dragRef.current = next;
    setDrag(next);
  }

  function handleEmptyTap(point: GridPoint) {
    setMarked(point);
    setOpenSheet('start');
  }

  function handleSelect(widgetId: string | null) {
    // Selecting a widget lets go of the marked cell; on a phone, its properties take the sheet's place.
    if (widgetId !== null) {
      setMarked(null);
      library.reset();
      setOpenSheet('end');
    } else if (openSheet === 'end') {
      setOpenSheet(null);
    }

    onSelect(widgetId);
  }

  function handleLibrarySelect(id: string) {
    const manifest = library.manifest(id);

    if (justDraggedRef.current || !manifest) {
      justDraggedRef.current = false;

      return;
    }

    if (marked) {
      add(manifest.type, marked);

      return;
    }

    idleClicksRef.current += 1;

    if (idleClicksRef.current >= CLICKS_BEFORE_HINT) {
      idleClicksRef.current = 0;
      toast.show(HINT, { dismissible: true });
    }
  }

  function handleItemPointerDown(id: string, event: PointerEvent<HTMLElement>) {
    const manifest = library.manifest(id);

    // Fingers scroll the list; only a mouse or pen drags out of it (0008).
    if (!manifest || event.pointerType === 'touch' || event.button !== 0) {
      return;
    }

    setDragState({
      pointerId: event.pointerId,
      manifest,
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

    add(current.manifest.type, current.point);
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

  const dropzone = drag?.dragging && drag.point ? place(drag.manifest.type, drag.point) : null;
  const ghost =
    dropzone ??
    (marked ? (library.highlightedType ? place(library.highlightedType, marked) : smallestPlace(marked)) : null);

  return (
    <>
      <PanelLayout
        end={{
          content: (
            <PropertiesPanel
              catalogue={catalogue}
              documentTokens={documentTokens}
              focusPageName={focusPageName}
              layout={layout}
              onChange={onChange}
              onDelete={onDeletePage}
              onDuplicate={onDuplicatePage}
              onSelect={handleSelect}
              page={page}
              selectedId={selectedId}
            />
          ),
          peek: true,
          title: propertiesTitle(page, selectedId, catalogue)
        }}
        onSheetClose={() => {
          setOpenSheet(null);
          setMarked(null);
          library.reset();
        }}
        onSheetOpen={side => {
          setOpenSheet(side);
          setMarked(null);
          library.reset();
        }}
        openSheet={widgetDragging && openSheet === 'end' ? null : openSheet}
        start={{
          content: (
            <LibraryList
              {...library.listProps}
              draggable={!marked}
              onItemPointerDown={handleItemPointerDown}
              onSelect={handleLibrarySelect}
            />
          ),
          title: 'Add a widget'
        }}
      >
        <Box containerType='size' height='full' width='full'>
          <Canvas
            {...canvasProps}
            ghost={ghost}
            newWidgetArea={smallestPlace}
            onDragChange={setWidgetDragging}
            onEmptyTap={handleEmptyTap}
            onSelect={handleSelect}
            pointerRef={canvasRef}
          />
        </Box>
      </PanelLayout>
      {drag?.dragging ? <DragLabel label={drag.manifest.label} x={drag.x} y={drag.y} /> : null}
    </>
  );
}

/** The library's list; rows only drag out of a sidebar, never a sheet (0008). */
function LibraryList({ draggable, onItemPointerDown, ...restProps }: SearchListProps) {
  const sidebar = usePanelForm() === 'sidebars';

  return (
    <SearchList
      {...restProps}
      draggable={sidebar && draggable}
      onItemPointerDown={sidebar ? onItemPointerDown : undefined}
    />
  );
}
