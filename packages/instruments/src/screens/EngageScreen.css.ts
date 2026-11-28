import { keyframes, style } from '@vanilla-extract/css';

import { glow } from '../primitives/styleHelpers.js';
import { token } from '../theme/token.js';

const breathe = keyframes({
  '50%': { opacity: 0.55 }
});

export const screen = style({
  backgroundColor: token('surface'),
  border: 'none',
  color: token('text.dim'),
  font: 'inherit',
  gap: '4cqmin',
  WebkitUserSelect: 'none',

  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${token('accent')}`,
      outlineOffset: '-2px'
    }
  }
});

export const name = style({
  fontSize: 'clamp(12px, 5cqmin, 28px)'
});

export const prompt = style({
  animation: `${breathe} 2.4s ease-in-out infinite`,
  border: `${token('border.width')} solid ${token('accent')}`,
  borderRadius: token('radius'),
  boxShadow: glow(token('accent')),
  color: token('accent'),
  fontSize: 'clamp(14px, 7cqmin, 40px)',
  letterSpacing: token('label.tracking'),
  padding: '3cqmin 6cqmin',
  textTransform: token('label.case') as 'uppercase',

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none'
    }
  }
});
