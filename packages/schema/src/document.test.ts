import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { createBlankDocument } from './blankDocument.js';
import {
  gameActionOf,
  MfdDocumentSchema,
  pageActionOf,
  WidgetInstanceSchema,
  type WidgetInstance
} from './document.js';

describe('widget actions (0018)', () => {
  const button = (action: unknown) => v.safeParse(WidgetInstanceSchema, { id: 'button-1', type: 'button', action });

  it('accepts a game action or a page to show', () => {
    expect(button('vehicle.gear-toggle').success).toBe(true);
    expect(button({ page: 'page-2' }).success).toBe(true);
  });

  it('rejects anything else', () => {
    expect(button({ page: '' }).success).toBe(false);
    expect(button({ action: 'vehicle.gear-toggle' }).success).toBe(false);
    expect(button('Not an id').success).toBe(false);
  });

  it('tells the two apart', () => {
    const game: WidgetInstance = { id: 'a', type: 'button', action: 'vehicle.gear-toggle' };
    const page: WidgetInstance = { id: 'b', type: 'button', action: { page: 'page-2' } };

    expect([gameActionOf(game), pageActionOf(game)]).toEqual(['vehicle.gear-toggle', undefined]);
    expect([gameActionOf(page), pageActionOf(page)]).toEqual([undefined, 'page-2']);
  });

  it('keeps a page button whose page is gone, so undoing a delete brings it back', () => {
    const document = createBlankDocument('Test', 'demo');
    const [page] = document.pages;

    expect(page).toBeDefined();

    const withButton = {
      ...document,
      pages: [
        {
          ...page,
          widgets: [{ id: 'to-nowhere', type: 'button', action: { page: 'deleted' } }],
          layouts: page?.layouts.map(layout => ({
            ...layout,
            areas: { 'to-nowhere': { column: 1, row: 1, columnSpan: 1, rowSpan: 1 } }
          }))
        }
      ]
    };

    expect(v.safeParse(MfdDocumentSchema, withButton).success).toBe(true);
  });
});
