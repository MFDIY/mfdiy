import { createVar, style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

/*
 * Only what the design system's classes can't express. Base UI's Drawer positions the sheet through
 * CSS variables it sets while it rests at a stop (`--drawer-snap-point-offset`) and while it's
 * dragged (`--drawer-swipe-movement-y`), and marks its entrance and exit with data attributes.
 */
const offset = 'calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px))';

/** How many sheets are stacked on this one, as Base UI counts them. */
const above = 'var(--nested-drawers, 0)';

/** How far a sheet rises for the first sheet stacked on it; each further level rises half as much again. */
const step = uiVars['spacing.4x'];

/** Where the top sheet of a stack is, copied onto the sheets under it, which follow it (0008). */
export const frontOffset = createVar();

export const popup = style({
  height: '100dvh',
  // What's below the screen's edge at the half stop isn't part of the visible sheet.
  paddingBottom: `max(0px, ${offset})`,
  transform: `translateY(${offset})`,
  transition: `transform ${uiVars['duration.long']} cubic-bezier(0.32, 0.72, 0, 1)`,
  willChange: 'transform',

  selectors: {
    '&[data-nested-drawer-open]': {
      pointerEvents: 'none',
      transform: `translateY(max(0px, calc(${frontOffset} - 2 * ${step} * (1 - pow(0.5, ${above})))))`
    },
    '&[data-nested-drawer-swiping]': {
      transition: 'none'
    },
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

/** Hidden and pressable through, until its sheet is modal or has a sheet stacked on it. */
export const backdrop = style({
  opacity: 0,
  pointerEvents: 'none',
  transition: `opacity ${uiVars['duration.long']} cubic-bezier(0.32, 0.72, 0, 1)`,

  selectors: {
    '&[data-modal], &:has(~ * [data-nested-drawer-open])': {
      opacity: 1,
      pointerEvents: 'auto'
    },
    '&[data-starting-style], &[data-ending-style]': {
      opacity: 0
    }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  }
});

export const content = style({
  selectors: {
    [`${popup}[data-peeking] &`]: { overflowY: 'visible' }
  }
});
