import { isValidTokenValue, oklchLightness, scaleNames, scaleSteps, type TokenName } from '@mfdiy/schema';
import { mfdiy } from '@mfdiy/ui';
import { describe, expect, it } from 'vitest';

import { amberCrt, phosphor } from './themes.js';

/** Neighbouring steps closer than this read as the same colour, and the scale stops being useful (0022). */
const MINIMUM_STEP_GAP = 0.04;

const themes = {
  mfdiy,
  Phosphor: phosphor,
  // A partial theme: whatever it leaves out comes from the defaults.
  'Amber CRT': { ...phosphor, ...amberCrt.tokens }
} as Record<string, Partial<Record<TokenName, string>>>;

describe.each(Object.entries(themes))('%s', (_, values) => {
  it('has only valid values', () => {
    for (const [name, value] of Object.entries(values)) {
      expect(isValidTokenValue(name as TokenName, value ?? ''), name).toBe(true);
    }
  });

  it.each(scaleNames)('keeps the steps of %s clearly distinct', scale => {
    const lightness = scaleSteps.map(step => oklchLightness(values[`${scale}.${step}`] ?? ''));

    for (let step = 1; step < lightness.length; step++) {
      expect(lightness[step]! - lightness[step - 1]!, `${scale}.${step} → ${scale}.${step + 1}`).toBeGreaterThanOrEqual(
        MINIMUM_STEP_GAP
      );
    }
  });
});
