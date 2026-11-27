import { MAX_PAGE_NAME_LENGTH, type MfdDocument, type Page } from './document.js';
import { seedGrid } from './shape.js';

/** An id no page in the document has, e.g. `page-2`. */
export function newPageId(document: MfdDocument): string {
  const ids = new Set(document.pages.map(page => page.id));
  let number = 1;

  while (ids.has(`page-${number}`)) {
    number++;
  }

  return `page-${number}`;
}

/** The document with an empty page at the end, named "Page _n_", its grid seeded from the profile's shape as it is now (0006, 0008). */
export function addPage(document: MfdDocument): { document: MfdDocument; id: string } {
  const names = new Set(document.pages.map(page => page.name));
  let number = document.pages.length + 1;

  while (names.has(`Page ${number}`)) {
    number++;
  }

  const page: Page = {
    id: newPageId(document),
    name: `Page ${number}`,
    widgets: [],
    layouts: [{ orientation: 'any', grid: seedGrid(document.shape), areas: {} }]
  };

  return { document: { ...document, pages: [...document.pages, page] }, id: page.id };
}

const CLONE_SUFFIX = ' (clone)';

/** "_Name_ (clone)", shortening the name if the result would be too long. */
export function cloneName(name: string): string {
  return `${name.slice(0, MAX_PAGE_NAME_LENGTH - CLONE_SUFFIX.length).trimEnd()}${CLONE_SUFFIX}`;
}

/** The document with a copy of a page right after it, named "_Name_ (clone)" (0023). */
export function duplicatePage(document: MfdDocument, id: string): { document: MfdDocument; id: string } {
  const index = document.pages.findIndex(page => page.id === id);
  const page = document.pages[index];

  if (!page) {
    return { document, id };
  }

  const copy: Page = { ...structuredClone(page), id: newPageId(document), name: cloneName(page.name) };
  const pages = [...document.pages.slice(0, index + 1), copy, ...document.pages.slice(index + 1)];

  return { document: { ...document, pages }, id: copy.id };
}

/**
 * The document without a page, and the page to show instead: the one before it, or after it if it
 * was the first. A document always keeps one page, so the last can't be removed.
 */
export function removePage(document: MfdDocument, id: string): { document: MfdDocument; id: string } {
  const index = document.pages.findIndex(page => page.id === id);

  if (index === -1 || document.pages.length === 1) {
    return { document, id };
  }

  const pages = document.pages.filter(page => page.id !== id);
  const next = pages[Math.max(index - 1, 0)];

  return { document: { ...document, pages }, id: next?.id ?? id };
}
