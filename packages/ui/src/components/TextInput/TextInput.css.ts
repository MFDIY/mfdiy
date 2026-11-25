import { style } from '@vanilla-extract/css';

const square = style({
  aspectRatio: '1 / 1'
});

const trim = style({
  paddingBlock: '1px',
  paddingRight: '1px'
});

export const clearButton = style([square, trim]);

export const removeNativeDecoration = style({
  selectors: {
    '&::-webkit-search-cancel-button': {
      display: 'none'
    },
    '&::-webkit-search-decoration': {
      display: 'none'
    }
  }
});
