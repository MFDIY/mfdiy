import { keyframes, style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

const pulse = keyframes({
  '50%': { opacity: 0.4 }
});

export const button = style({
  backgroundColor: token('button.face'),
  border: `${token('border.width')} solid ${token('button.outline')}`,
  borderRadius: token('radius'),
  color: token('button.label'),
  font: 'inherit',
  fontSize: 'clamp(10px, 24cqmin, 22px)',
  letterSpacing: '0.08em',
  padding: '0 4cqmin',
  textTransform: token('label.case') as 'uppercase',
  transition: transition('background-color', 'border-color', 'box-shadow', 'transform'),
  WebkitUserSelect: 'none',

  selectors: {
    '&:active': {
      transform: 'scale(0.97)'
    },
    '&:focus-visible': {
      outline: `2px solid ${token('accent')}`,
      outlineOffset: '2px'
    },
    '&[data-status="pending"]': {
      animation: `${pulse} 0.8s ease-in-out infinite`
    },
    '&[aria-current="page"]': {
      borderColor: token('status.on'),
      color: token('status.on')
    },
    '&[data-status="ok"]': {
      borderColor: token('status.on'),
      boxShadow: glow(token('status.on'))
    },
    '&[data-status="failed"]': {
      borderColor: token('button.failed'),
      boxShadow: glow(token('button.failed'))
    },
    '&:disabled': {
      opacity: 0.4
    }
  },

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      transition: 'none'
    }
  }
});
