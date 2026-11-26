import type { Elevation } from './props/Elevation.js';
import type { DesignSystem } from '../../styles/design-system.js';

/** Flat (0022): elevation is only a step in tone, never a shadow. */
export const backgroundColor = {
  base: 'surface',
  depressed: 'surface',
  floating: 'surface.raised',
  raised: 'surface.raised'
} as const satisfies Record<Elevation, DesignSystem['backgroundColor']>;
