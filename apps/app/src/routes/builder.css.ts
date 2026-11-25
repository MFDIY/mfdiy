import { style } from '@vanilla-extract/css';

export const builder = style({
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  height: '100dvh',
  overflow: 'hidden',
  overscrollBehavior: 'none'
});

export const toolbar = style({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px 16px',
  padding: '8px 16px'
});

export const tabs = style({
  display: 'flex',
  gap: '8px'
});

export const tab = style({
  appearance: 'none',
  backgroundColor: 'transparent',
  border: '1px solid currentColor',
  borderRadius: '4px',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  minHeight: '44px',
  opacity: 0.6,
  padding: '0 16px',

  selectors: {
    '&[aria-pressed="true"]': {
      opacity: 1
    }
  }
});

/** Room around the canvas, so resize handles on its edges stay on screen. */
export const stage = style({
  minHeight: 0,
  padding: '16px'
});
