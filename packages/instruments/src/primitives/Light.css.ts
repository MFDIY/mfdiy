import { style } from '@vanilla-extract/css';

import { token } from '../theme/token.js';

import { glow, transition } from './styleHelpers.js';

export const light = style({
  backgroundColor: token('light.off'),
  border: `${token('border.width')} solid ${token('line')}`,
  borderRadius: token('radius'),
  color: token('light.off.text'),
  fontSize: 'clamp(9px, 28cqmin, 22px)',
  letterSpacing: '0.08em',
  padding: '0 4cqmin',
  textTransform: token('label.case') as 'uppercase',
  transition: transition('background-color', 'color', 'box-shadow'),

  selectors: {
    '&[data-state="on"]': {
      backgroundColor: token('light.on'),
      borderColor: token('light.on'),
      boxShadow: glow(token('light.on')),
      color: token('light.on.text')
    },
    '&[data-state="warning"]': {
      backgroundColor: token('light.warning'),
      borderColor: token('light.warning'),
      boxShadow: glow(token('light.warning')),
      color: token('light.warning.text')
    },
    '&[data-state="critical"]': {
      backgroundColor: token('light.critical'),
      borderColor: token('light.critical'),
      boxShadow: glow(token('light.critical')),
      color: token('light.critical.text')
    }
  }
});
