import type { Area, ResizeHandle, WidgetInstance } from '@mfdiy/schema';
import type { PointerEvent, ReactNode } from 'react';

import { applyTokens, LayoutArea } from '@mfdiy/instruments';
import { Box } from '@mfdiy/ui/components';

import * as styles from './Canvas.css.js';
import { widgetName } from './widgetInfo.js';

const resizeHandles = [
  // Edges first, so corners are on top where they overlap.
  { column: 0, row: -1, cursor: 'ns-resize' },
  { column: 1, row: 0, cursor: 'ew-resize' },
  { column: 0, row: 1, cursor: 'ns-resize' },
  { column: -1, row: 0, cursor: 'ew-resize' },
  { column: -1, row: -1, cursor: 'nwse-resize' },
  { column: 1, row: -1, cursor: 'nesw-resize' },
  { column: 1, row: 1, cursor: 'nwse-resize' },
  { column: -1, row: 1, cursor: 'nesw-resize' }
] as const satisfies (ResizeHandle & { cursor: string })[];

type CanvasWidgetProps = {
  widget: WidgetInstance;
  area: Area;
  selected: boolean;
  /** Distance from its position while being dragged, in pixels. */
  lifted: { x: number; y: number } | null;
  onSelect: (widgetId: string) => void;
  onPointerDown: (event: PointerEvent<HTMLElement>, widgetId: string, handle?: ResizeHandle) => void;
  children: ReactNode;
};

/** A widget on the canvas, wrapped in everything needed to select, move and resize it. */
export function CanvasWidget({ widget, area, selected, lifted, onSelect, onPointerDown, children }: CanvasWidgetProps) {
  return (
    <LayoutArea
      area={area}
      minHeight='none'
      minWidth='none'
      offset={lifted}
      position='relative'
      zIndex={lifted ? '2' : selected ? '1' : 'auto'}
    >
      {/* Inert: widgets show live data here, but can't be pressed. */}
      <Box className={styles.content} cssVariables={applyTokens(widget.tokens)} height='full' inert>
        {children}
      </Box>
      {/* Covers the widget, so a press selects or drags it instead of triggering its action. */}
      <Box
        appearance='none'
        aria-label={widgetName(widget)}
        aria-pressed={selected}
        backgroundColor='transparent'
        borderStyle='hidden'
        boxShadow={selected ? 'canvas.selected' : 'none'}
        cursor={lifted ? 'grabbing' : 'grab'}
        height='full'
        inset='none'
        // Presses are handled as gestures; this is for assistive technology, which clicks without a pointer.
        onClick={event => {
          if (event.detail === 0) {
            onSelect(widget.id);
          }
        }}
        onPointerDown={event => onPointerDown(event, widget.id)}
        outlineColor='focus'
        outlineStyle={{ default: 'none', focusVisible: 'solid' }}
        outlineWidth='focus'
        padding='none'
        position='absolute'
        tagName='button'
        touchAction='none'
        type='button'
        width='full'
      />
      {selected && !lifted ? (
        // A size container, so handles can make room on small widgets. Lets presses through.
        <Box aria-hidden containerType='size' inset='none' pointerEvents='none' position='absolute'>
          {resizeHandles.map(({ column, row, cursor }) => (
            <Box
              className={[styles.handleColumn[column], styles.handleRow[row]]}
              cursor={cursor}
              data-column={column}
              data-row={row}
              // No room between the corners on narrow widgets: the corners alone can do everything.
              display={column === 0 ? { default: 'none', 100: 'block' } : 'block'}
              height='canvas.handle'
              key={`${column},${row}`}
              onPointerDown={event => onPointerDown(event, widget.id, { column, row })}
              pointerEvents='auto'
              position='absolute'
              touchAction='none'
              width='canvas.handle'
            >
              <Box
                backgroundColor='canvas.handle'
                borderColor='canvas.edit'
                borderStyle='solid'
                borderWidth='edit'
                boxShadow='canvas.halo'
                className={[styles.knob, styles.knobColumn[column], styles.knobRow[row]]}
                height='4x'
                pointerEvents='none'
                position='absolute'
                width='4x'
              />
            </Box>
          ))}
        </Box>
      ) : null}
    </LayoutArea>
  );
}
