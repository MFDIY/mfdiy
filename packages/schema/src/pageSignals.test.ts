import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { PageIdSchema } from './document.js';
import { pageOfSignal, pageSignalId, pageSignals } from './pageSignals.js';
import { IdSchema } from './signals.js';

describe('page signals', () => {
  it('has one on/off signal per page, named after it', () => {
    expect(pageSignals([{ id: 'flight', name: 'Flight' }])).toEqual([
      { id: 'mfd.page.flight', label: 'Flight', group: 'Pages', kind: 'boolean' }
    ]);
  });

  it('finds the page a signal is about', () => {
    expect(pageOfSignal(pageSignalId('page-2'))).toBe('page-2');
    expect(pageOfSignal('flight.speed')).toBeUndefined();
  });

  it('makes a valid signal id from any valid page id', () => {
    const longest = 'a'.repeat(48);

    expect(v.is(PageIdSchema, longest)).toBe(true);
    expect(v.is(IdSchema, pageSignalId(longest))).toBe(true);
    expect(v.is(PageIdSchema, 'a'.repeat(49))).toBe(false);
    expect(v.is(PageIdSchema, 'Page 1')).toBe(false);
  });
});
