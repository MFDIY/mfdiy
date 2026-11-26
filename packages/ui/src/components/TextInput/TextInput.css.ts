import { style } from '@vanilla-extract/css';

/** Only what the design system's classes can't express: a search input's own clear and decoration. */
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
