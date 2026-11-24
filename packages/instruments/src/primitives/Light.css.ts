import { style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

export const light = style({
  alignItems: 'center',
  backgroundColor: token('light.off'),
  border: `${token('size.border')} solid ${token('outline')}`,
  borderRadius: token('size.radius'),
  color: token('text.dim'),
  display: 'flex',
  fontSize: 'clamp(9px, 28cqmin, 22px)',
  justifyContent: 'center',
  letterSpacing: '0.08em',
  overflow: 'hidden',
  padding: '0 4cqmin',
  textTransform: 'uppercase',
  transition: transition('background-color', 'color', 'box-shadow'),
  whiteSpace: 'nowrap',

  selectors: {
    '&[data-state="on"]': {
      backgroundColor: token('light.on'),
      borderColor: token('light.on'),
      boxShadow: glow(token('light.on')),
      color: token('light.text')
    },
    '&[data-state="caution"]': {
      backgroundColor: token('state.caution'),
      borderColor: token('state.caution'),
      boxShadow: glow(token('state.caution')),
      color: token('light.text')
    },
    '&[data-state="warning"]': {
      backgroundColor: token('state.warning'),
      borderColor: token('state.warning'),
      boxShadow: glow(token('state.warning')),
      color: token('light.text')
    }
  }
});

export const pressable = style({
  appearance: 'none',
  cursor: 'pointer',
  font: 'inherit',
  touchAction: 'manipulation',
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
      opacity: 0.6
    },
    '&[data-status="failed"]': {
      outline: `2px solid ${token('state.warning')}`,
      outlineOffset: '2px'
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.4
    }
  }
});
