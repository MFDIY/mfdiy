import { MfdDocumentSchema } from '@mfdiy/schema';
import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { starterDocuments } from './starterDocuments.js';

describe('starter documents', () => {
  it.each(starterDocuments)('$name is a valid document for this game', document => {
    const result = v.safeParse(MfdDocumentSchema, document);

    expect(result.issues).toBeUndefined();
    expect(document.game).toBe('star-citizen');
  });
});
