import { style } from '@vanilla-extract/css';

import { globalVars } from '../../styles/vars.css.js';

const scrollbar = style({
  scrollbarColor: 'gray transparent',
  scrollbarWidth: 'thin'
});

const maxHeight = style({
  maxHeight: 'var(--max-height, none)'
});

const scrollPadding = style({
  scrollPaddingBlock: globalVars['spacing.6x']
});

export const container = style([scrollbar, maxHeight, scrollPadding]);
