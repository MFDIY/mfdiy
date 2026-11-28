import { MfdDocumentSchema, pagesWithSubgridOverlap, unreachablePages } from '@mfdiy/schema';
import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { starterDocuments } from './starterDocuments.js';

describe('starter documents', () => {
  it.each(starterDocuments)('$name is a valid document for this game', document => {
    const result = v.safeParse(MfdDocumentSchema, document);

    expect(result.issues).toBeUndefined();
    expect(document.game).toBe('star-citizen');
  });

  it.each(starterDocuments)('$name reaches every page with page buttons (0026)', document => {
    expect([...unreachablePages(document)]).toEqual([]);
  });

  it.each(starterDocuments)('$name leaves room for its shared subgrids on every page (0026)', document => {
    expect([...pagesWithSubgridOverlap(document)]).toEqual([]);
  });
});
