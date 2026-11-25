import * as v from 'valibot';
import { expect, it } from 'vitest';

import { createBlankDocument } from './blankDocument.js';
import { MfdDocumentSchema } from './document.js';

it('is a valid document', () => {
  expect(v.is(MfdDocumentSchema, createBlankDocument('Fighter', 'test'))).toBe(true);
});
