import type { Elevation } from './props/Elevation.js';
import type { DesignSystem } from '../../styles/design-system.js';

export const backgroundColor = {
  base: 'elevation.base',
  depressed: 'elevation.depressed',
  floating: 'elevation.floating',
  raised: 'elevation.raised'
} as const satisfies Record<Elevation, DesignSystem['backgroundColor']>;

export const boxShadow = {
  base: 'elevation.base',
  depressed: 'elevation.depressed',
  floating: 'elevation.floating',
  raised: 'elevation.raised'
} as const satisfies Record<Elevation, DesignSystem['boxShadow']>;
