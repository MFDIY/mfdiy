import { token } from '@mfdiy/instruments';
import { globalVars } from '@mfdiy/ui';
import { createVar, style, styleVariants } from '@vanilla-extract/css';

/*
 * Only what Bonsai's style props can't express: geometry computed from the canvas, and MFD tokens.
 * Everything else is a style prop.
 */

const gap = createVar();

/** Same proportions as the display, but relative to the canvas instead of the viewport. */
export const page = style({
  vars: { [gap]: 'clamp(4px, 1.5cqmin, 16px)' },
  padding: gap,
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none'
});

export const grid = style({ gap });

/**
 * Reaches half a gap beyond the grid, so it divides exactly into cells and its dots sit in the
 * middle of the gaps. The canvas also measures cell sizes from it.
 */
export const dots = style({ inset: `calc(${gap} / -2)` });

/** The MFD's own background, so the dot grid doesn't show through widgets. */
export const content = style({ backgroundColor: token('surface') });

const handleSize = globalVars['size.canvas.handle'];

// Handles reach half their size into the widget, but always leave its middle free for dragging.
const insetX = `min(${handleSize} / 2, 30cqw)`;
const insetY = `min(${handleSize} / 2, 30cqh)`;

const centred = `calc(50% - ${handleSize} / 2)`;

export const handleColumn = styleVariants({
  '-1': { left: `calc(${insetX} - ${handleSize})` },
  '0': { left: centred },
  '1': { right: `calc(${insetX} - ${handleSize})` }
});

export const handleRow = styleVariants({
  '-1': { top: `calc(${insetY} - ${handleSize})` },
  // Hidden where there's no room between the corners. Bonsai's container conditions only know widths.
  '0': { top: centred, '@container': { '(max-height: 99px)': { display: 'none' } } },
  '1': { bottom: `calc(${insetY} - ${handleSize})` }
});

/** The visible part of a handle, on the widget's edge wherever that runs through the hit target. */
export const knob = style({ transform: 'translate(-50%, -50%)' });

export const knobColumn = styleVariants({
  '-1': { left: `calc(100% - ${insetX})` },
  '0': { left: '50%' },
  '1': { left: insetX }
});

export const knobRow = styleVariants({
  '-1': { top: `calc(100% - ${insetY})` },
  '0': { top: '50%' },
  '1': { top: insetY }
});

/** Fits inside even the smallest area. Its ancestor is the size container. */
export const plus = style({
  height: 'min(36px, 70cqmin)',
  width: 'min(36px, 70cqmin)'
});
