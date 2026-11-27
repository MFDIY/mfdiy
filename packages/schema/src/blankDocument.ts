import { DEFAULT_SHAPE, DOCUMENT_SCHEMA_VERSION, type MfdDocument, type Shape } from './document.js';
import { seedGrid } from './shape.js';

/** A document with one empty page, its grid seeded with square-ish cells for the shape (0006). */
export function createBlankDocument(name: string, game: string, shape: Shape = DEFAULT_SHAPE): MfdDocument {
  return {
    schema: DOCUMENT_SCHEMA_VERSION,
    fit: 'contain',
    game,
    name,
    pages: [
      {
        id: 'page-1',
        name: 'Page 1',
        widgets: [],
        layouts: [{ orientation: 'any', grid: seedGrid(shape), areas: {} }]
      }
    ],
    shape
  };
}
