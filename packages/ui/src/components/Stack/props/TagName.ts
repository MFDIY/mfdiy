export const tagNames = [
  'article',
  'aside',
  'div',
  'dl',
  'fieldset',
  'footer',
  'header',
  'main',
  'nav',
  'ol',
  'section',
  'span',
  'ul'
] as const satisfies (keyof HTMLElementTagNameMap)[];

export type TagName = (typeof tagNames)[number];
