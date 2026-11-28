import { createVar, keyframes, style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { light } from './Light.css.js';
import { glow, transition } from './styleHelpers.js';

const cueColor = createVar();
const thickness = `calc(${token('border.width')} * 2)`;
const corner = 'clamp(6px, 18cqmin, 18px)';

const angle = createVar({ syntax: '<angle>', inherits: false, initialValue: '0deg' });

const spin = keyframes({ to: { [angle]: '360deg' } });
const appear = keyframes({ to: { opacity: 1 } });

export const pressable = style({
  appearance: 'none',
  backgroundColor: 'transparent',
  border: 'none',
  color: 'inherit',
  display: 'block',
  font: 'inherit',
  padding: 0,
  textAlign: 'inherit',
  WebkitTapHighlightColor: 'transparent',
  WebkitUserSelect: 'none',
  vars: { [cueColor]: token('press.cue') },

  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${token('accent')}`,
      outlineOffset: '2px'
    },
    '&[aria-current="page"]': {
      vars: { [cueColor]: token('press.current') }
    },
    '&[data-status="ok"]': {
      vars: { [cueColor]: token('press.current') }
    },
    '&[data-status="failed"]': {
      outline: `2px solid ${token('press.failed')}`,
      outlineOffset: '2px',
      vars: { [cueColor]: token('press.failed') }
    },
    '&:disabled': {
      opacity: 0.4
    },
    '&[data-cue$="-outside"]': {
      padding: 'clamp(3px, 6cqmin, 6px)'
    },
    [`&[data-cue$="-inked"]:has(${light}[data-state="on"])`]: {
      vars: { [cueColor]: token('light.on.text') }
    },
    [`&[data-cue$="-inked"]:has(${light}[data-state="warning"])`]: {
      vars: { [cueColor]: token('light.warning.text') }
    },
    [`&[data-cue$="-inked"]:has(${light}[data-state="critical"])`]: {
      vars: { [cueColor]: token('light.critical.text') }
    }
  }
});

export const cue = style({
  transition: transition('background', 'border-color', 'box-shadow'),

  selectors: {
    [`${pressable}[data-cue^="corners"] &`]: {
      background: [
        `linear-gradient(${cueColor}, ${cueColor}) top left / ${corner} ${thickness}`,
        `linear-gradient(${cueColor}, ${cueColor}) top left / ${thickness} ${corner}`,
        `linear-gradient(${cueColor}, ${cueColor}) top right / ${corner} ${thickness}`,
        `linear-gradient(${cueColor}, ${cueColor}) top right / ${thickness} ${corner}`,
        `linear-gradient(${cueColor}, ${cueColor}) bottom left / ${corner} ${thickness}`,
        `linear-gradient(${cueColor}, ${cueColor}) bottom left / ${thickness} ${corner}`,
        `linear-gradient(${cueColor}, ${cueColor}) bottom right / ${corner} ${thickness}`,
        `linear-gradient(${cueColor}, ${cueColor}) bottom right / ${thickness} ${corner}`
      ].join(', '),
      backgroundRepeat: 'no-repeat'
    },
    [`${pressable}[data-cue^="frame"] &`]: {
      border: `${token('border.width')} solid ${cueColor}`,
      borderRadius: token('radius'),
      inset: 'clamp(2px, 5cqmin, 5px)'
    },
    [`${pressable}[data-cue="frame-outside"] &`]: {
      inset: 0
    },
    [`${pressable}[aria-current="page"] &, ${pressable}[data-status="ok"] &`]: {
      filter: `drop-shadow(${glow(cueColor)})`
    }
  }
});

/** A light running around the edge while the game hasn't answered yet; only after a moment, so quick answers don't flash. */
export const busy = style({
  borderRadius: token('radius'),
  display: 'none',
  padding: thickness,
  background: `conic-gradient(from ${angle}, transparent 0deg 250deg, ${token('press.pending')} 330deg, transparent 360deg)`,
  mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
  opacity: 0,
  animation: `${appear} 0s 150ms forwards, ${spin} 1.2s linear infinite`,

  selectors: {
    [`${pressable}[data-status="pending"] &`]: { display: 'block' }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      background: token('press.pending'),
      opacity: 1
    }
  }
});
