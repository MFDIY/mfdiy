import {
  containerSizeAndMediaAndPseudoConditionalProperties,
  containerSizeAndPseudoConditionalProperties,
  containerSizeConditionalProperties,
  mediaAndPseudoConditionalProperties,
  pseudoConditionalProperties,
  unconditionalProperties
} from '../src/styles/sprinkles.css.js';

import { extractArgTypesFromStyleProps } from './extractArgTypesFromStyleProps.js';

export const stylePropArgTypes = extractArgTypesFromStyleProps(
  containerSizeAndMediaAndPseudoConditionalProperties,
  containerSizeAndPseudoConditionalProperties,
  containerSizeConditionalProperties,
  mediaAndPseudoConditionalProperties,
  pseudoConditionalProperties,
  unconditionalProperties
);
