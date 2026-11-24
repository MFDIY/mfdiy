import { MfdDocumentSchema } from '@mfdiy/schema';
import * as v from 'valibot';
import { expect, it } from 'vitest';

import { demoDocument } from './demoDocument.js';

it('is a valid document', () => {
  const result = v.safeParse(MfdDocumentSchema, demoDocument);

  expect(result.issues).toBeUndefined();
});
