import { sprinkles as designSystem } from './sprinkles.css.js';

export type {
  ContainerSizeAndMediaAndPseudoCondition,
  ContainerSizeAndMediaAndPseudoConditionalValue,
  ContainerSizeAndPseudoCondition,
  ContainerSizeAndPseudoConditionalValue,
  ContainerSizeCondition,
  ContainerSizeConditionalValue,
  MediaAndPseudoCondition,
  MediaAndPseudoConditionalValue,
  PseudoCondition,
  PseudoConditionalValue
} from './sprinkles.css.js';

export {
  mapContainerSizeAndMediaAndPseudoConditionalValue,
  mapContainerSizeAndPseudoConditionalValue,
  mapContainerSizeConditionalValue,
  mapMediaAndPseudoConditionalValue,
  mapPseudoConditionalValue,
  normalizeContainerSizeAndMediaAndPseudoConditionalValue,
  normalizeContainerSizeAndPseudoConditionalValue,
  normalizeContainerSizeConditionalValue,
  normalizeMediaAndPseudoConditionalValue,
  normalizePseudoConditionalValue
} from './sprinkles.css.js';

export { colorSchemeVars, globalVars } from './vars.css.js';

export type DesignSystem = Parameters<typeof designSystem>[0];

export { designSystem };

export const colorSchemes = ['light', 'dark'] as const;

export type ColorScheme = (typeof colorSchemes)[number];
