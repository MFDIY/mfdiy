import { style } from '@vanilla-extract/css';

import { uiVars } from '../../styles/vars.css.js';

const scrollbar = style({
  scrollbarColor: 'gray transparent',
  scrollbarWidth: 'thin'
});

const maxHeight = style({
  maxHeight: 'var(--max-height, none)'
});

const scrollPadding = style({
  scrollPaddingBlock: uiVars['spacing.6x']
});

export const container = style([scrollbar, maxHeight, scrollPadding]);
