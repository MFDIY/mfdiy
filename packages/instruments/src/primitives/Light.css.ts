import { style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

export const light = style({
  backgroundColor: token('light.off'),
  border: `${token('size.border')} solid ${token('outline')}`,
  borderRadius: token('size.radius'),
  color: token('text.dim'),
  fontSize: 'clamp(9px, 28cqmin, 22px)',
  letterSpacing: '0.08em',
  padding: '0 4cqmin',
  textTransform: 'uppercase',
  transition: transition('background-color', 'color', 'box-shadow'),

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
  font: 'inherit',
  WebkitUserSelect: 'none',

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
      opacity: 0.4
    }
  }
});
