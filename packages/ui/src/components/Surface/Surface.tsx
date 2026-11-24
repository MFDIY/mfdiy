import type { Elevation } from './props/Elevation.js';
import type { TagName } from '../Box/props/TagName.js';

import { mapPseudoConditionalValue, type PseudoConditionalValue } from '../../styles/sprinkles.css.js';
import { Box, type BoxProps } from '../Box/Box.js';

import * as elevationMaps from './elevationMaps.js';

export { elevations } from './props/Elevation.js';
export { tagNames } from '../Box/props/TagName.js';

export type SurfaceProps<T extends TagName> = Omit<BoxProps<T>, 'backgroundColor' | 'boxShadow'> & {
  elevation: PseudoConditionalValue<Elevation>;
};

export function Surface<T extends TagName = 'div'>({ children, elevation, ...restProps }: SurfaceProps<T>) {
  const backgroundColor = mapPseudoConditionalValue(elevation, v => elevationMaps.backgroundColor[v]);
  const boxShadow = mapPseudoConditionalValue(elevation, v => elevationMaps.boxShadow[v]);

  return (
    <Box {...restProps} backgroundColor={backgroundColor} boxShadow={boxShadow}>
      {children}
    </Box>
  );
}
