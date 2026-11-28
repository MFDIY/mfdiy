import { starCitizen } from '@mfdiy/adapter-star-citizen';
import { describe, expect, it } from 'vitest';

import { createSource, DEFAULT_SOURCE } from './sources.js';

describe('createSource', () => {
  it('starts on the simulator', () => {
    const created = createSource(DEFAULT_SOURCE, starCitizen);

    expect('source' in created && created.source.kind).toBe('simulator');

    if ('source' in created) {
      created.source.stop();
    }
  });

  it("says the game connection isn't built yet", () => {
    expect(createSource('game', starCitizen)).toEqual({ unavailable: expect.stringContaining('Star Citizen') });
  });
});
