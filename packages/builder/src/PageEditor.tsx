import type { CanvasHandle, CanvasProps, CanvasSurround, CanvasView } from './canvas/Canvas.js';
import type { Catalogue } from './palette/choices.js';
import type { ProfileSettings } from './properties/ProfileProperties.js';
import type { Area, GridPoint, Layout, Page, SharedSubgrid, WidgetInstance } from '@mfdiy/schema';

import { applyTokens, LayoutArea, widgetManifests, type WidgetManifest } from '@mfdiy/instruments';
import {
  addSubgrid,
  addWidget,
  formatShape,
  growArea,
  newWidgetId,
  pageToSubgrid,
  placeArea,
  removeSubgrid,
  subgridArea,
  subgridAsPage,
  withSubgrid
} from '@mfdiy/schema';
import {
  Box,
  PanelLayout,
  SearchList,
  usePanelForm,
  useToast,
  type PanelSide,
  type SearchListProps
} from '@mfdiy/ui/components';
import { useEffect, useImperativeHandle, useRef, useState, type PointerEvent, type ReactNode, type Ref } from 'react';

import * as styles from './canvas/Canvas.css.js';
import { Canvas } from './canvas/Canvas.js';
import { CanvasLabel } from './canvas/CanvasLabel.js';
import { widgetDefaultSize, widgetMinSize } from './canvas/widgetInfo.js';
import { DragLabel } from './palette/DragLabel.js';
import { useWidgetLibrary } from './palette/useWidgetLibrary.js';
import { PropertiesPanel } from './properties/PropertiesPanel.js';
import { SubgridProperties } from './properties/SubgridProperties.js';
import { propertiesTitle, type PageChoice } from './properties/title.js';
import {
  splitSubgridsFromPage,
  SUBGRID_TYPE,
  SubgridContents,
  subgridIdOf,
  subgridManifest,
  subgridWidgetId,
  withSubgridsOnPage
} from './subgrids/subgrids.js';

export type PageEditorProps = Omit<
  CanvasProps,
  | 'ghost'
  | 'handleRef'
  | 'label'
  | 'newWidgetArea'
  | 'onChange'
  | 'onDragChange'
  | 'onEmptyTap'
  | 'onOutsideTap'
  | 'onPanHint'
  | 'reveal'
  | 'surround'
> & {
  catalogue: Catalogue;
  /** The shared subgrid entered, if any: its widgets are edited instead of the page's (0026). */
  enteredSubgridId?: string | null | undefined;
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
  /** Enters a shared subgrid, or leaves it with `null` (0026). */
  onEnterSubgrid?: ((id: string | null) => void) | undefined;
  /** Changes the profile's name, shape or fit, from its settings (0006). */
  onProfileChange?: ((profile: ProfileSettings, merge?: string) => void) | undefined;
  /** Changes the profile's shared subgrids; without it, none can be added (0026). */
  onSubgridsChange?: ((subgrids: SharedSubgrid[], merge?: string) => void) | undefined;
  /** The profile's pages, which a page button can show (0018). Without them, only this page. */
  pages?: readonly PageChoice[] | undefined;
  /**
   * The profile the page belongs to: named with the page and its shape in a label above the canvas,
   * which opens its settings. Without it, there's no label.
   */
  profile?: ProfileSettings | undefined;
  /** The profile's shared subgrids, shown above the page's widgets on every page (0026). */
  subgrids?: readonly SharedSubgrid[] | undefined;
  /** No page button leads to the page; its properties say so (0026). */
  unreachable?: boolean | undefined;
  /** Receives a `CanvasView`, to zoom from outside, e.g. the header's menu (0024). */
  viewRef?: Ref<CanvasView> | undefined;
};

/** What the canvas edits: the page, with its shared subgrids standing on it, or the subgrid entered. */
type Edited = {
  layout: Layout;
  onChange: (page: Page, merge?: string) => void;
  page: Page;
  renderWidget: (widget: WidgetInstance) => ReactNode;
  surround?: CanvasSurround | undefined;
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

const PAN_HINT = 'Use two fingers to move or zoom the page.';

/**
 * The canvas between the widget library and the properties panel (0006, 0008), laid out by
 * PanelLayout. A widget is added where a cell was marked, or where it's dropped; never somewhere
 * guessed. As sidebars, the library is there to drag from; as sheets, it opens when a cell is
 * tapped. The properties panel (0023) shows the selected widget, or the page; as a sheet, it peeks
 * while a widget is moved or resized. Use one per page, with the page's id as its key.
 */
export function PageEditor({
  catalogue,
  enteredSubgridId = null,
  focusPageName = false,
  onDeletePage,
  onDuplicatePage,
  onEnterSubgrid,
  onProfileChange,
  onSubgridsChange,
  pages: pagesProp,
  profile,
  subgrids = [],
  unreachable = false,
  viewRef,
  ...canvasProps
}: PageEditorProps) {
  const {
    page,
    layout: pageLayout,
    documentTokens,
    onChange: onPageChange,
    onSelect,
    renderWidget,
    selectedId
  } = canvasProps;
  const pages = pagesProp ?? [page];
  const entered = subgrids.find(subgrid => subgrid.id === enteredSubgridId);
  const edited = entered
    ? editSubgrid(entered, page, pageLayout, subgrids, renderWidget, (next, merge) =>
        onSubgridsChange?.(withSubgrid(subgrids, next), merge)
      )
    : editPage(page, pageLayout, subgrids, renderWidget, onPageChange, onSubgridsChange);
  const { layout } = edited;
  const selectedSubgrid = entered ? undefined : subgrids.find(subgrid => subgridWidgetId(subgrid.id) === selectedId);
  const [marked, setMarked] = useState<GridPoint | null>(null);
  const [openSheet, setOpenSheet] = useState<PanelSide | null>(focusPageName ? 'end' : null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [widgetDragging, setWidgetDragging] = useState(false);
  /** Whether the properties show the profile's settings, after its label was pressed. */
  const [profileShown, setProfileShown] = useState(false);
  const dragRef = useRef<Drag | null>(null);
  const canvasRef = useRef<CanvasHandle>(null);
  /** A drag that ends on its own row also clicks it; that click mustn't count. */
  const justDraggedRef = useRef(false);
  const idleClicksRef = useRef(0);

  const toast = useToast();
  const library = useWidgetLibrary({
    documentTokens,
    extra: onSubgridsChange && !entered ? [subgridManifest] : [],
    pageTokens: page.tokens
  });

  // Escape leaves a subgrid, as pressing outside it does (0026); not while typing or in a popup.
  useEffect(() => {
    if (!enteredSubgridId || !onEnterSubgrid) {
      return;
    }

    const leave = onEnterSubgrid;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target instanceof Element ? event.target : null;

      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        !target?.closest('input, textarea, select, [contenteditable], [role="dialog"], [role="menu"], [role="listbox"]')
      ) {
        leave(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enteredSubgridId, onEnterSubgrid]);

  useImperativeHandle(viewRef, () => ({
    fit: () => canvasRef.current?.fit(),
    zoomIn: () => canvasRef.current?.zoomIn(),
    zoomOut: () => canvasRef.current?.zoomOut()
  }));

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
    const manifest = type === SUBGRID_TYPE ? subgridManifest : widgetManifests[type];

    return manifest
      ? growArea(
          layout,
          smallest,
          widgetDefaultSize(manifest, layout.grid),
          widgetMinSize({ id: '', type }, layout.grid)
        )
      : smallest;
  }

  /**
   * Adds a widget of a type, without data yet (0006); its properties ask for that next. A shared
   * subgrid starts empty, asking nothing (0026).
   */
  function add(type: string, point: GridPoint) {
    if (type === SUBGRID_TYPE) {
      const added = addSubgrid(subgrids, place(type, point), pageLayout.grid);

      onSubgridsChange?.(added.subgrids);
      handleSelect(subgridWidgetId(added.id));

      return;
    }

    const id = newWidgetId(edited.page, type);

    edited.onChange(addWidget(edited.page, layout, { id, type }, place(type, point)));
    handleSelect(id);
  }

  function setDragState(next: Drag | null) {
    dragRef.current = next;
    setDrag(next);
  }

  function handleEmptyTap(point: GridPoint) {
    // Like a selection, the profile's settings are let go of first.
    if (profileShown) {
      setProfileShown(false);
      setOpenSheet(null);

      return;
    }

    setMarked(point);
    setOpenSheet('start');
  }

  /**
   * A click in the white space around the page, or on the hatching around an entered subgrid, lets
   * go of whatever is active: a widget, the profile, a marked cell, and then the subgrid (0026).
   */
  function handleOutsideTap() {
    if (selectedId !== null) {
      handleSelect(null);
    } else if (profileShown || marked) {
      setProfileShown(false);
      setMarked(null);
      library.reset();
      setOpenSheet(null);
    } else if (entered) {
      onEnterSubgrid?.(null);
    }
  }

  function handleSelect(widgetId: string | null) {
    // Selecting a widget lets go of the marked cell; on a phone, its properties take the sheet's place.
    if (widgetId !== null) {
      setProfileShown(false);
      setMarked(null);
      library.reset();
      setOpenSheet('end');
    } else if (openSheet === 'end') {
      setOpenSheet(null);
    }

    onSelect(widgetId);
  }

  function handleShowProfile() {
    setProfileShown(true);
    setMarked(null);
    library.reset();
    setOpenSheet('end');
    onSelect(null);
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
          content: selectedSubgrid ? (
            <SubgridProperties
              entered={false}
              key={selectedSubgrid.id}
              onChange={(next, merge) => onSubgridsChange?.(withSubgrid(subgrids, next), merge)}
              onEnter={() => onEnterSubgrid?.(selectedSubgrid.id)}
              onRemove={() => {
                onSubgridsChange?.(removeSubgrid(subgrids, selectedSubgrid.id));
                handleSelect(null);
              }}
              subgrid={selectedSubgrid}
            />
          ) : entered && selectedId === null ? (
            <SubgridProperties
              entered
              key={entered.id}
              onChange={(next, merge) => onSubgridsChange?.(withSubgrid(subgrids, next), merge)}
              onExit={() => onEnterSubgrid?.(null)}
              subgrid={entered}
            />
          ) : (
            <PropertiesPanel
              catalogue={catalogue}
              documentTokens={documentTokens}
              focusPageName={focusPageName}
              key={entered?.id ?? page.id}
              layout={entered ? layout : pageLayout}
              onChange={entered ? edited.onChange : onPageChange}
              onDelete={onDeletePage}
              onDuplicate={onDuplicatePage}
              onProfileChange={onProfileChange}
              onSelect={handleSelect}
              page={entered ? edited.page : page}
              pages={pages}
              profile={profileShown ? profile : undefined}
              selectedId={selectedId}
              unreachable={unreachable}
            />
          ),
          peek: true,
          title:
            selectedSubgrid || (entered && selectedId === null)
              ? 'Shared subgrid'
              : profileShown && profile && selectedId === null
                ? 'Profile'
                : propertiesTitle(edited.page, selectedId, catalogue, pages)
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
            handleRef={canvasRef}
            label={
              profile ? (
                <CanvasLabel
                  detail={`${formatShape(profile.shape)} · ${pageLayout.grid.columns} × ${pageLayout.grid.rows}`}
                  onPress={handleShowProfile}
                  pressed={profileShown && selectedId === null}
                  title={`${profile.name} · ${page.name}`}
                />
              ) : undefined
            }
            layout={layout}
            newWidgetArea={smallestPlace}
            onChange={edited.onChange}
            onDragChange={setWidgetDragging}
            onEmptyTap={handleEmptyTap}
            onOutsideTap={handleOutsideTap}
            onPanHint={() => toast.show(PAN_HINT, { id: PAN_HINT })}
            onSelect={handleSelect}
            page={edited.page}
            renderWidget={edited.renderWidget}
            reveal={(selectedId === null ? null : layout.areas[selectedId]) ?? (marked ? ghost : null)}
            surround={edited.surround}
          />
        </Box>
      </PanelLayout>
      {drag?.dragging ? <DragLabel label={drag.manifest.label} x={drag.x} y={drag.y} /> : null}
    </>
  );
}

/**
 * The page, with the profile's shared subgrids standing on it as widgets above its own, under a
 * neutral hatching (0026). A change goes to the page or to the subgrids, whichever it touched.
 */
function editPage(
  page: Page,
  layout: Layout,
  subgrids: readonly SharedSubgrid[],
  renderWidget: (widget: WidgetInstance) => ReactNode,
  onPageChange: (page: Page, merge?: string) => void,
  onSubgridsChange: ((subgrids: SharedSubgrid[], merge?: string) => void) | undefined
): Edited {
  const combined = withSubgridsOnPage(page, layout, subgrids);

  return {
    layout: combined.layout,
    onChange: (next, merge) => {
      const split = splitSubgridsFromPage(next, page, layout, subgrids);

      if (split.page) {
        onPageChange(split.page, merge);
      } else if (split.subgrids) {
        onSubgridsChange?.(split.subgrids, merge);
      }
    },
    page: combined.page,
    renderWidget: widget => {
      const subgrid = subgrids.find(candidate => candidate.id === subgridIdOf(widget.id));

      return subgrid ? <SubgridContents renderWidget={renderWidget} subgrid={subgrid} /> : renderWidget(widget);
    }
  };
}

/**
 * An entered shared subgrid, edited as a page, with the page around it under a hatching that covers
 * everything but the subgrid (0026).
 */
function editSubgrid(
  subgrid: SharedSubgrid,
  page: Page,
  layout: Layout,
  subgrids: readonly SharedSubgrid[],
  renderWidget: (widget: WidgetInstance) => ReactNode,
  onChange: (subgrid: SharedSubgrid, merge?: string) => void
): Edited {
  const asPage: Page = { ...subgridAsPage(subgrid), tokens: page.tokens };

  return {
    layout: asPage.layouts[0] ?? layout,
    onChange: (next, merge) => onChange(pageToSubgrid(subgrid, next), merge),
    page: asPage,
    renderWidget,
    surround: {
      area: subgridArea(subgrid.place, layout.grid),
      content: (
        <>
          {page.widgets.map(widget => {
            const area = layout.areas[widget.id];

            return area ? (
              <LayoutArea
                area={area}
                className={styles.content}
                cssVariables={applyTokens(widget.tokens)}
                key={widget.id}
                minHeight='none'
                minWidth='none'
              >
                {renderWidget(widget)}
              </LayoutArea>
            ) : null;
          })}
          {subgrids
            .filter(other => other !== subgrid)
            .map(other => (
              <LayoutArea area={subgridArea(other.place, layout.grid)} key={other.id} minHeight='none' minWidth='none'>
                <SubgridContents renderWidget={renderWidget} subgrid={other} />
              </LayoutArea>
            ))}
        </>
      ),
      grid: layout.grid
    }
  };
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
