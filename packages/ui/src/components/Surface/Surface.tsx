import type { Elevation } from './props/Elevation.js';
import type { TagName } from '../Box/props/TagName.js';

import { mapMediaAndPseudoConditionalValue, type MediaAndPseudoConditionalValue } from '../../styles/sprinkles.css.js';
import { Box, type BoxProps } from '../Box/Box.js';

import * as elevationMaps from './elevationMaps.js';

export { elevations } from './props/Elevation.js';
export { tagNames } from '../Box/props/TagName.js';

export type SurfaceProps<T extends TagName> = Omit<BoxProps<T>, 'backgroundColor'> & {
  elevation: MediaAndPseudoConditionalValue<Elevation>;
};

export function Surface<T extends TagName = 'div'>({ children, elevation, ...restProps }: SurfaceProps<T>) {
  const backgroundColor = mapMediaAndPseudoConditionalValue(elevation, v => elevationMaps.backgroundColor[v]);

  return (
    <Box {...restProps} backgroundColor={backgroundColor}>
      {children}
    </Box>
  );
}
