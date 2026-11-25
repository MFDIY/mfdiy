import { DOCUMENT_SCHEMA_VERSION, type MfdDocument } from './document.js';
import { DEFAULT_GRID } from './layoutEditing.js';

/** A document with one empty page. */
export function createBlankDocument(name: string, game: string): MfdDocument {
  return {
    schema: DOCUMENT_SCHEMA_VERSION,
    name,
    game,
    pages: [
      {
        id: 'page-1',
        name: 'Page 1',
        widgets: [],
        layouts: [{ orientation: 'any', grid: DEFAULT_GRID, areas: {} }]
      }
    ]
  };
}
