export const tagNames = [
  'article',
  'aside',
  'div',
  'footer',
  'header',
  'main',
  'nav',
  'ol',
  'p',
  'section',
  'span',
  'ul'
] as const satisfies (keyof HTMLElementTagNameMap)[];

export type TagName = (typeof tagNames)[number];
