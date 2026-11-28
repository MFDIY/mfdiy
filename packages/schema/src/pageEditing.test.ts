import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { createBlankDocument } from './blankDocument.js';
import { MAX_PAGE_NAME_LENGTH, MfdDocumentSchema, type MfdDocument } from './document.js';
import { addPage, cloneName, duplicatePage, newPageId, removePage, unreachablePages } from './pageEditing.js';

const blank = createBlankDocument('Test', 'star-citizen');

const configured: MfdDocument = {
  ...blank,
  pages: blank.pages.map(page => ({
    ...page,
    widgets: [{ id: 'bar-1', type: 'bar', bindings: { value: { signal: 'fuel' } } }],
    layouts: page.layouts.map(layout => ({
      ...layout,
      areas: { 'bar-1': { column: 1, row: 1, columnSpan: 4, rowSpan: 4 } }
    }))
  }))
};

function pageNames(document: MfdDocument) {
  return document.pages.map(page => page.name);
}

describe('newPageId', () => {
  it('skips the ids that are taken', () => {
    expect(newPageId(blank)).toBe('page-2');
  });
});

describe('addPage', () => {
  it('adds an empty page at the end and returns its id', () => {
    const { document, id } = addPage(blank);

    expect(pageNames(document)).toEqual(['Page 1', 'Page 2']);
    expect(document.pages[1]).toMatchObject({ id, widgets: [] });
    expect(v.safeParse(MfdDocumentSchema, document).issues).toBeUndefined();
  });

  it('numbers it after the names that are taken', () => {
    const renamed = { ...blank, pages: blank.pages.map(page => ({ ...page, name: 'Page 2' })) };

    expect(pageNames(addPage(renamed).document)).toEqual(['Page 2', 'Page 3']);
  });
});

describe('cloneName', () => {
  it('adds "(clone)"', () => {
    expect(cloneName('Flight')).toBe('Flight (clone)');
  });

  it('shortens a long name to fit', () => {
    const name = cloneName('x'.repeat(MAX_PAGE_NAME_LENGTH));

    expect(name).toHaveLength(MAX_PAGE_NAME_LENGTH);
    expect(name.endsWith(' (clone)')).toBe(true);
  });
});

describe('duplicatePage', () => {
  it('puts a copy right after the page, with its widgets', () => {
    const two = addPage(configured).document;
    const { document, id } = duplicatePage(two, 'page-1');

    expect(pageNames(document)).toEqual(['Page 1', 'Page 1 (clone)', 'Page 2']);
    expect(document.pages[1]?.id).toBe(id);
    expect(document.pages[1]?.widgets).toEqual(configured.pages[0]?.widgets);
    expect(v.safeParse(MfdDocumentSchema, document).issues).toBeUndefined();
  });

  it("doesn't share anything with the original", () => {
    const { document } = duplicatePage(configured, 'page-1');

    expect(document.pages[1]?.widgets[0]).not.toBe(document.pages[0]?.widgets[0]);
  });
});

describe('removePage', () => {
  const three = addPage(addPage(blank).document).document;

  it('shows the page before the one removed', () => {
    const { document, id } = removePage(three, 'page-2');

    expect(pageNames(document)).toEqual(['Page 1', 'Page 3']);
    expect(id).toBe('page-1');
  });

  it('shows the next page when the first is removed', () => {
    expect(removePage(three, 'page-1').id).toBe('page-2');
  });

  it('keeps the last page', () => {
    expect(removePage(blank, 'page-1').document).toBe(blank);
  });
});

describe('MfdDocumentSchema', () => {
  it('refuses two pages with the same id', () => {
    const page = blank.pages[0];
    const twice = { ...blank, pages: page ? [page, { ...page, name: 'Other' }] : [] };

    expect(v.safeParse(MfdDocumentSchema, twice).success).toBe(false);
  });
});

describe('unreachablePages (0026)', () => {
  const three = addPage(addPage(blank).document).document;
  const [first, second, third] = three.pages;
  const button = (id: string, page: string) => ({ id, type: 'label', action: { page } });
  const withButtons = (page: MfdDocument['pages'][number] | undefined, targets: string[]) =>
    page && {
      ...page,
      widgets: targets.map(target => button(`to-${target}`, target)),
      layouts: page.layouts.map(layout => ({
        ...layout,
        areas: Object.fromEntries(
          targets.map((target, index) => [`to-${target}`, { column: index + 1, row: 1, columnSpan: 1, rowSpan: 1 }])
        )
      }))
    };

  it('is every page but the first without page buttons', () => {
    expect([...unreachablePages(three)]).toEqual([second?.id, third?.id]);
  });

  it('follows page buttons from the first page, and only from pages that are reached', () => {
    const chained = {
      ...three,
      pages: [withButtons(first, [second?.id ?? '']), second, withButtons(third, [first?.id ?? ''])].filter(
        page => page !== undefined
      )
    };

    expect([...unreachablePages(chained)]).toEqual([third?.id]);
  });

  it('counts page buttons in a shared subgrid, which is on every page', () => {
    const shared: MfdDocument = {
      ...three,
      subgrids: [
        {
          areas: {
            'to-2': { column: 1, row: 1, columnSpan: 1, rowSpan: 1 },
            'to-3': { column: 2, row: 1, columnSpan: 1, rowSpan: 1 }
          },
          grid: { columns: 2, rows: 1 },
          id: 'subgrid-1',
          place: { area: { column: 1, row: 1, columnSpan: 2, rowSpan: 1 }, grid: { columns: 24, rows: 15 } },
          widgets: [button('to-2', second?.id ?? ''), button('to-3', third?.id ?? '')]
        }
      ]
    };

    expect(unreachablePages(shared).size).toBe(0);
  });
});
