import type { Area, ResizeHandle, WidgetInstance } from '@mfdiy/schema';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';

import { applyTokens } from '@mfdiy/instruments';

import * as styles from './Canvas.css.js';
import { widgetName } from './widgetInfo.js';

const resizeHandles: readonly ResizeHandle[] = [
  // Edges first, so corners are on top where they overlap.
  { column: 0, row: -1 },
  { column: 1, row: 0 },
  { column: 0, row: 1 },
  { column: -1, row: 0 },
  { column: -1, row: -1 },
  { column: 1, row: -1 },
  { column: 1, row: 1 },
  { column: -1, row: 1 }
];

type CanvasWidgetProps = {
  widget: WidgetInstance;
  area: Area;
  selected: boolean;
  /** Distance from its position while being dragged, in pixels. */
  lifted: { x: number; y: number } | null;
  instructionsId: string;
  onSelect: (widgetId: string) => void;
  onKeyDown: (event: KeyboardEvent, widgetId: string) => void;
  onPointerDown: (event: PointerEvent<HTMLElement>, widgetId: string, handle?: ResizeHandle) => void;
  children: ReactNode;
};

/** A widget on the canvas, wrapped in everything needed to select, move and resize it. */
export function CanvasWidget({
  widget,
  area,
  selected,
  lifted,
  instructionsId,
  onSelect,
  onKeyDown,
  onPointerDown,
  children
}: CanvasWidgetProps) {
  return (
    <div
      className={styles.slot}
      data-lifted={lifted ? '' : undefined}
      data-selected={selected ? '' : undefined}
      style={{
        gridColumn: `${area.column} / span ${area.columnSpan}`,
        gridRow: `${area.row} / span ${area.rowSpan}`,
        transform: lifted ? `translate(${lifted.x}px, ${lifted.y}px)` : undefined
      }}
    >
      {/* Inert: widgets show live data here, but can't be pressed or focused. */}
      <div className={styles.content} inert style={applyTokens(widget.tokens)}>
        {children}
      </div>
      <button
        aria-describedby={instructionsId}
        aria-label={`${widgetName(widget)}, column ${area.column}, row ${area.row}`}
        aria-pressed={selected}
        className={styles.hit}
        onClick={() => onSelect(widget.id)}
        onKeyDown={event => onKeyDown(event, widget.id)}
        onMouseDown={event => {
          // Safari takes the focus away from a pressed button, and arrow keys need it.
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
        }}
        onPointerDown={event => onPointerDown(event, widget.id)}
        type='button'
      />
      {selected && !lifted ? (
        // Pointer only: Shift + arrow keys are the keyboard equivalent.
        <div aria-hidden className={styles.handles}>
          {resizeHandles.map(handle => (
            <div
              className={styles.handle}
              data-column={handle.column}
              data-row={handle.row}
              key={`${handle.column},${handle.row}`}
              // Keep the focus on the widget, so Escape and arrow keys keep working.
              onMouseDown={event => event.preventDefault()}
              onPointerDown={event => onPointerDown(event, widget.id, handle)}
              role='presentation'
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
