import { style } from '@vanilla-extract/css';

export const square = style({
  aspectRatio: '1 / 1'
});

export const depressed = style({
  transform: 'translateY(1px) scale(0.99)'
});
