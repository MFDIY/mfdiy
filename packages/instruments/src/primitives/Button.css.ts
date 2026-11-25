import { keyframes, style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

const pulse = keyframes({
  '50%': { opacity: 0.4 }
});

export const button = style({
  alignItems: 'center',
  appearance: 'none',
  backgroundColor: token('button.background'),
  border: `${token('size.border')} solid ${token('button.outline')}`,
  borderRadius: token('size.radius'),
  color: token('button.text'),
  cursor: 'pointer',
  display: 'flex',
  font: 'inherit',
  fontSize: 'clamp(10px, 24cqmin, 22px)',
  justifyContent: 'center',
  letterSpacing: '0.08em',
  padding: '0 4cqmin',
  textTransform: 'uppercase',
  touchAction: 'none',
  transition: transition('background-color', 'border-color', 'box-shadow', 'transform'),
  userSelect: 'none',

  selectors: {
    '&:active': {
      transform: 'scale(0.97)'
    },
    '&:focus-visible': {
      outline: `2px solid ${token('state.on')}`,
      outlineOffset: '2px'
    },
    '&[data-status="pending"]': {
      animation: `${pulse} 0.8s ease-in-out infinite`
    },
    '&[data-status="ok"]': {
      borderColor: token('state.on'),
      boxShadow: glow(token('state.on'))
    },
    '&[data-status="failed"]': {
      borderColor: token('state.warning'),
      boxShadow: glow(token('state.warning'))
    },
    '&:disabled': {
      cursor: 'not-allowed',
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
