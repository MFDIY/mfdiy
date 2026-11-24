export const tagNames = [
  'article',
  'aside',
  'div',
  'dl',
  'footer',
  'header',
  'main',
  'nav',
  'section'
] as const satisfies (keyof HTMLElementTagNameMap)[];

export type TagName = (typeof tagNames)[number];
