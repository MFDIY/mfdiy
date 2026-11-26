import { sprinkles as designSystem } from './sprinkles.css.js';

export type {
  ContainerSizeCondition,
  ContainerSizeConditionalValue,
  MediaAndPseudoCondition,
  MediaAndPseudoConditionalValue
} from './sprinkles.css.js';

export {
  mapContainerSizeConditionalValue,
  mapMediaAndPseudoConditionalValue,
  normalizeContainerSizeConditionalValue,
  normalizeMediaAndPseudoConditionalValue
} from './sprinkles.css.js';

export { uiVars } from './vars.css.js';

export type DesignSystem = Parameters<typeof designSystem>[0];

export { designSystem };
