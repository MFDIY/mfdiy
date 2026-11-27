import { globalStyle, style } from '@vanilla-extract/css';

export const reset = style({});

globalStyle(':root', {
  scrollPaddingInlineStart: '100%'
});

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box'
});

/**
 * The page is the root container, so container queries have something to answer to even where
 * nothing closer is one: in popups rendered at the end of the page, such as a menu, and in parts
 * that always span the page, such as the builder's header.
 */
globalStyle('body', {
  containerType: 'inline-size',
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

/** No italics anywhere (0022): Martian Mono has none, and a browser's faked slant looks broken. */
globalStyle('address, cite, dfn, em, i, var', {
  fontStyle: 'normal'
});

/** Links that aren't a `TextLink` take the colour of the text around them, never browser blue. */
globalStyle('a', {
  color: 'inherit'
});

globalStyle('ol, ul', {
  listStyleType: 'none'
});
