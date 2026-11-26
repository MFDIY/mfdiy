import {
  containerSizeConditionalProperties,
  mediaAndPseudoConditionalProperties,
  unconditionalProperties
} from '../src/styles/sprinkles.css.js';

import { extractArgTypesFromStyleProps } from './extractArgTypesFromStyleProps.js';

export const stylePropArgTypes = extractArgTypesFromStyleProps(
  containerSizeConditionalProperties,
  mediaAndPseudoConditionalProperties,
  unconditionalProperties
);
