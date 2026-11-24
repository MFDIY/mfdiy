import { globalStyle, style } from '@vanilla-extract/css';

export const reset = style({});

globalStyle(':root', {
  scrollPaddingInlineStart: '100%'
});

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box'
});

globalStyle('body', {
  overflowX: 'clip',
  WebkitFontSmoothing: 'antialiased'
});

globalStyle('blockquote, body, dd, fieldset, h1, h2, h3, h4, h5, h6, html, legend, li, ol, p, ul', {
  margin: '0px',
  padding: '0px'
});

globalStyle('button, input, select, textarea', {
  font: 'inherit'
});

globalStyle('fieldset, select', {
  border: 'none'
});

globalStyle('ol, ul', {
  listStyleType: 'none'
});
