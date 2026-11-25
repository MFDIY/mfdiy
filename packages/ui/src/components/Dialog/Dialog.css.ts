import { style } from '@vanilla-extract/css';

export const dialog = style({
  // Never wider or taller than the screen, however little of it a phone's keyboard leaves.
  maxHeight: 'calc(100dvh - 26px)',
  width: 'min(420px, calc(100dvw - 26px))',

  '::backdrop': {
    backgroundColor: '#0009'
  }
});
