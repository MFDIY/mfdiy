export const tagNames = [
  'blockquote',
  'dd',
  'div',
  'dt',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'label',
  'legend',
  'li',
  'p',
  's',
  'span',
  'strong'
] as const satisfies (keyof HTMLElementTagNameMap)[];

export type TagName = (typeof tagNames)[number];
