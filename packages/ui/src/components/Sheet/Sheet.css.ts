import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/*
 * Base UI's Drawer positions the sheet through CSS variables it sets while it rests at a stop
 * (`--drawer-snap-point-offset`) and while it's dragged (`--drawer-swipe-movement-y`).
 */
const offset = 'calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px))';

/** Covers the screen, but lets everything outside the sheet be pressed: the sheet is not modal. */
export const viewport = style({
  alignItems: 'flex-end',
  display: 'flex',
  inset: 0,
  pointerEvents: 'none',
  position: 'fixed'
});

export const popup = style({
  backgroundColor: uiVars['surface'],
  borderTop: `${uiVars['border.hairline']} solid ${uiVars['line.strong']}`,
  boxSizing: 'border-box',
  color: uiVars['text'],
  display: 'flex',
  flexDirection: 'column',
  height: '100dvh',
  outline: 'none',
  // What's below the screen's edge at the half stop isn't part of the visible sheet.
  paddingBottom: `max(0px, ${offset})`,
  pointerEvents: 'auto',
  touchAction: 'none',
  transform: `translateY(${offset})`,
  transition: `transform ${uiVars['duration.long']} cubic-bezier(0.32, 0.72, 0, 1)`,
  width: '100%',
  willChange: 'transform',

  selectors: {
    '&[data-starting-style], &[data-ending-style]': {
      paddingBottom: 0,
      transform: 'translateY(100%)'
    },
    '&[data-swiping]': {
      transition: 'none',
      userSelect: 'none'
    }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  }
});

/** The top of the sheet, by which it's dragged. */
export const header = style({
  flexShrink: 0,
  touchAction: 'none',
  userSelect: 'none'
});

/** Shows where to grab the sheet; the whole header drags. */
export const handle = style({
  cursor: 'grab',
  display: 'flex',
  justifyContent: 'center',
  paddingBlock: uiVars['spacing.3x']
});

export const grabBar = style({
  backgroundColor: uiVars['line.strong'],
  height: '3px',
  width: '36px'
});

/** Scrolls on its own; the page never does (0007). */
export const content = style({
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  scrollbarColor: `${uiVars['line.strong']} transparent`,
  scrollbarWidth: 'thin',
  touchAction: 'auto'
});
