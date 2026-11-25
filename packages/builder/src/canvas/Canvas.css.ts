import { token } from '@mfdiy/instruments';
import { createVar, globalStyle, style } from '@vanilla-extract/css';

/*
 * Editing controls are drawn on top of MFDs with any theme, so they use fixed colours with a dark
 * halo rather than MFD tokens: a user's theme must never hide the selection (0003).
 */
const accent = '#4da3ff';
const invalid = '#ff4d4d';
const halo = '#000b';

const gap = createVar();
const handleSize = createVar();

/** Fills whatever box it's given; `frame` is fitted inside it. */
export const viewport = style({
  containerType: 'size',
  display: 'grid',
  height: '100%',
  minHeight: 0,
  minWidth: 0,
  placeItems: 'center',
  position: 'relative',
  width: '100%'
});

/** The MFD screen. Its width and height are set inline from the preview shape. */
export const frame = style({
  containerType: 'size',
  position: 'relative'
});

/** Same proportions as the display, but relative to the canvas instead of the viewport. */
export const page = style({
  vars: {
    [gap]: 'clamp(4px, 1.5cqmin, 16px)',
    [handleSize]: '24px'
  },
  boxSizing: 'border-box',
  height: '100%',
  overscrollBehavior: 'none',
  padding: gap,
  touchAction: 'none',
  userSelect: 'none',
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',

  '@media': {
    '(any-pointer: coarse)': {
      vars: { [handleSize]: '44px' }
    }
  }
});

export const grid = style({
  display: 'grid',
  gap,
  height: '100%',
  position: 'relative'
});

/**
 * A dot on every cell corner, in the middle of the gap. The layer reaches half a gap beyond the
 * grid, so it divides exactly into cells; the builder also measures cell sizes from it. Its
 * `backgroundSize` (one cell) is set inline.
 */
export const dots = style({
  backgroundImage: ['0 0', '100% 0', '0 100%', '100% 100%']
    .map(corner => `radial-gradient(circle at ${corner}, ${token('text.dim')} 1.5px, transparent 2px)`)
    .join(', '),
  inset: `calc(${gap} / -2)`,
  opacity: 0.7,
  pointerEvents: 'none',
  position: 'absolute'
});

export const slot = style({
  minHeight: 0,
  minWidth: 0,
  position: 'relative',

  selectors: {
    '&[data-selected]': { zIndex: 1 },
    '&[data-lifted]': { opacity: 0.75, zIndex: 3 }
  }
});

/** Opaque, so the dot grid doesn't show through widgets. */
export const content = style({
  backgroundColor: token('surface'),
  height: '100%'
});

/** Covers the widget, so a press selects or drags it instead of triggering its action. */
export const hit = style({
  appearance: 'none',
  backgroundColor: 'transparent',
  border: 0,
  borderRadius: token('size.radius'),
  cursor: 'grab',
  inset: 0,
  margin: 0,
  outline: 'none',
  padding: 0,
  position: 'absolute',
  touchAction: 'none',

  selectors: {
    '&[aria-pressed="true"]': {
      boxShadow: `0 0 0 2px ${accent}, 0 0 0 4px ${halo}`
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${accent}, 0 0 0 6px ${halo}`
    },
    '[data-lifted] &': { cursor: 'grabbing' }
  }
});

/** Snapped preview of where the widget will land. Above the lifted widget, or it would hide a red ghost. */
export const ghost = style({
  backgroundColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
  border: `2px solid ${accent}`,
  borderRadius: token('size.radius'),
  boxShadow: `0 0 0 1px ${halo}`,
  boxSizing: 'border-box',
  pointerEvents: 'none',
  position: 'relative',
  zIndex: 4,

  selectors: {
    // Striped and dashed as well as red, so it doesn't rely on colour alone.
    '&[data-invalid]': {
      background: `repeating-linear-gradient(45deg, color-mix(in srgb, ${invalid} 45%, transparent) 0 6px, color-mix(in srgb, ${invalid} 15%, transparent) 6px 12px)`,
      borderColor: invalid,
      borderStyle: 'dashed'
    }
  }
});

/** A size container, so handles can make room on small widgets. Lets presses through to `hit`. */
export const handles = style({
  containerType: 'size',
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute'
});

// Handles reach half their size into the widget, but always leave its middle free for dragging.
const insetX = `min(${handleSize} / 2, 30cqw)`;
const insetY = `min(${handleSize} / 2, 30cqh)`;

export const handle = style({
  height: handleSize,
  pointerEvents: 'auto',
  position: 'absolute',
  touchAction: 'none',
  width: handleSize,

  selectors: {
    '&[data-column="-1"]': { left: `calc(${insetX} - ${handleSize})` },
    '&[data-column="0"]': { left: `calc(50% - ${handleSize} / 2)` },
    '&[data-column="1"]': { right: `calc(${insetX} - ${handleSize})` },
    '&[data-row="-1"]': { top: `calc(${insetY} - ${handleSize})` },
    '&[data-row="0"]': { top: `calc(50% - ${handleSize} / 2)` },
    '&[data-row="1"]': { bottom: `calc(${insetY} - ${handleSize})` },
    '&[data-column="0"][data-row]': { cursor: 'ns-resize' },
    '&[data-row="0"][data-column]': { cursor: 'ew-resize' },
    '&[data-column="-1"][data-row="-1"], &[data-column="1"][data-row="1"]': { cursor: 'nwse-resize' },
    '&[data-column="1"][data-row="-1"], &[data-column="-1"][data-row="1"]': { cursor: 'nesw-resize' }
  },

  // The visible part is smaller than the hit target, and sits on the widget's edge.
  '::before': {
    backgroundColor: '#fff',
    border: `2px solid ${accent}`,
    borderRadius: '3px',
    boxShadow: `0 0 0 1px ${halo}`,
    boxSizing: 'border-box',
    content: '',
    height: '12px',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: '12px'
  }
});

// Where the widget's edge runs through the handle, per axis.
const edgePosition = {
  x: { '-1': `calc(100% - ${insetX})`, '0': '50%', '1': insetX },
  y: { '-1': `calc(100% - ${insetY})`, '0': '50%', '1': insetY }
};

for (const [side, left] of Object.entries(edgePosition.x)) {
  globalStyle(`${handle}[data-column="${side}"]::before`, { left });
}

for (const [side, top] of Object.entries(edgePosition.y)) {
  globalStyle(`${handle}[data-row="${side}"]::before`, { top });
}

// No room for edge handles between the corners: corners alone can do everything.
globalStyle(`${handle}[data-column="0"]`, {
  '@container': { '(max-width: 47px)': { display: 'none' } },
  '@media': { '(any-pointer: coarse)': { '@container': { '(max-width: 87px)': { display: 'none' } } } }
});

globalStyle(`${handle}[data-row="0"]`, {
  '@container': { '(max-height: 47px)': { display: 'none' } },
  '@media': { '(any-pointer: coarse)': { '@container': { '(max-height: 87px)': { display: 'none' } } } }
});

export const visuallyHidden = style({
  clipPath: 'inset(50%)',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px'
});
