import {
  createMapValueFn,
  createNormalizeValueFn,
  createSprinkles,
  defineProperties,
  type ConditionalValue
} from '@vanilla-extract/sprinkles';

import { containerSizeConditions } from './conditions/containerSize.js';
import { mediaConditions } from './conditions/media.js';
import { pseudoConditions } from './conditions/pseudo.js';
import * as properties from './properties.js';

export const containerSizeAndMediaAndPseudoConditionalProperties = defineProperties({
  conditions: {
    default: {},
    ...containerSizeConditions,
    ...mediaConditions,
    ...pseudoConditions
  },
  defaultCondition: 'default',
  properties: {
    backdropFilter: properties.backdropFilter,
    backgroundColor: properties.backgroundColor,
    boxShadow: properties.boxShadow,
    color: properties.color,
    display: properties.display,
    fontSize: properties.fontSize,
    fontWeight: properties.fontWeight,
    height: properties.height,
    letterSpacing: properties.letterSpacing,
    lineHeight: properties.lineHeight,
    maxHeight: properties.height,
    maxWidth: properties.width,
    minHeight: properties.height,
    minWidth: properties.width,
    opacity: properties.opacity,
    overflowX: properties.overflow,
    overflowY: properties.overflow,
    paddingBottom: properties.paddingBlock,
    paddingLeft: properties.paddingInline,
    paddingRight: properties.paddingInline,
    paddingTop: properties.paddingBlock,
    position: properties.position,
    transform: properties.transform,
    visibility: properties.visibility,
    width: properties.width
  },
  shorthands: {
    overflow: ['overflowX', 'overflowY'],
    padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    paddingBlock: ['paddingTop', 'paddingBottom'],
    paddingInline: ['paddingLeft', 'paddingRight']
  }
});

export const mapContainerSizeAndMediaAndPseudoConditionalValue = createMapValueFn(
  containerSizeAndMediaAndPseudoConditionalProperties
);
export const normalizeContainerSizeAndMediaAndPseudoConditionalValue = createNormalizeValueFn(
  containerSizeAndMediaAndPseudoConditionalProperties
);

export type ContainerSizeAndMediaAndPseudoCondition =
  ContainerSizeCondition | PseudoCondition | ('default' | keyof typeof mediaConditions);

export type ContainerSizeAndMediaAndPseudoConditionalValue<Value extends string | number> = ConditionalValue<
  typeof containerSizeAndMediaAndPseudoConditionalProperties,
  Value
>;

export const containerSizeAndPseudoConditionalProperties = defineProperties({
  conditions: {
    default: {},
    ...containerSizeConditions,
    ...pseudoConditions
  },
  defaultCondition: 'default',
  properties: {
    borderBottomColor: properties.borderColor,
    borderBottomWidth: properties.borderWidth,
    borderLeftColor: properties.borderColor,
    borderLeftWidth: properties.borderWidth,
    borderRightColor: properties.borderColor,
    borderRightWidth: properties.borderWidth,
    borderTopColor: properties.borderColor,
    borderTopWidth: properties.borderWidth,
    transitionDuration: properties.transitionDuration,
    zIndex: properties.zIndex
  },
  shorthands: {
    borderColor: ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'],
    borderColorX: ['borderLeftColor', 'borderRightColor'],
    borderColorY: ['borderTopColor', 'borderBottomColor'],
    borderWidth: ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
    borderWidthX: ['borderLeftWidth', 'borderRightWidth'],
    borderWidthY: ['borderTopWidth', 'borderBottomWidth']
  }
});

export const mapContainerSizeAndPseudoConditionalValue = createMapValueFn(containerSizeAndPseudoConditionalProperties);
export const normalizeContainerSizeAndPseudoConditionalValue = createNormalizeValueFn(
  containerSizeAndPseudoConditionalProperties
);

export type ContainerSizeAndPseudoCondition = ContainerSizeCondition | PseudoCondition;

export type ContainerSizeAndPseudoConditionalValue<Value extends string | number> = ConditionalValue<
  typeof containerSizeAndPseudoConditionalProperties,
  Value
>;

export const mediaAndPseudoConditionalProperties = defineProperties({
  conditions: {
    default: {},
    ...mediaConditions,
    ...pseudoConditions
  },
  defaultCondition: 'default',
  properties: {
    backgroundSize: properties.backgroundSize,
    touchAction: properties.touchAction,
    userSelect: properties.userSelect
  }
});

export const mapMediaAndPseudoConditionalValue = createMapValueFn(mediaAndPseudoConditionalProperties);
export const normalizeMediaAndPseudoConditionalValue = createNormalizeValueFn(mediaAndPseudoConditionalProperties);

export type MediaCondition = 'default' | keyof typeof mediaConditions;

export type MediaAndPseudoCondition = MediaCondition | PseudoCondition;

export type MediaAndPseudoConditionalValue<Value extends string | number> = ConditionalValue<
  typeof mediaAndPseudoConditionalProperties,
  Value
>;

export const containerSizeConditionalProperties = defineProperties({
  conditions: {
    default: {},
    ...containerSizeConditions
  },
  defaultCondition: 'default',
  properties: {
    alignItems: properties.alignItems,
    alignSelf: properties.alignSelf,
    borderBottomLeftRadius: properties.spacing,
    borderBottomRightRadius: properties.spacing,
    borderTopLeftRadius: properties.spacing,
    borderTopRightRadius: properties.spacing,
    columnGap: properties.spacing,
    flexBasis: properties.flexBasis,
    flexDirection: properties.flexDirection,
    flexGrow: properties.flexGrow,
    flexShrink: properties.flexShrink,
    flexWrap: properties.flexWrap,
    justifyContent: properties.justifyContent,
    rowGap: properties.spacing,
    textAlign: properties.textAlign
  },
  shorthands: {
    borderRadius: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'],
    borderBottomRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
    borderLeftRadius: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
    borderRightRadius: ['borderTopRightRadius', 'borderBottomRightRadius'],
    borderTopRadius: ['borderTopLeftRadius', 'borderTopRightRadius'],
    gap: ['rowGap', 'columnGap']
  }
});

export const mapContainerSizeConditionalValue = createMapValueFn(containerSizeConditionalProperties);
export const normalizeContainerSizeConditionalValue = createNormalizeValueFn(containerSizeConditionalProperties);

export type ContainerSizeCondition =
  'default' | (keyof typeof containerSizeConditions extends `${infer N extends number}` ? N : never);

export type ContainerSizeConditionalValue<Value extends string | number> = ConditionalValue<
  typeof containerSizeConditionalProperties,
  Value
>;

export const pseudoConditionalProperties = defineProperties({
  conditions: {
    default: {},
    ...pseudoConditions
  },
  defaultCondition: 'default',
  properties: {
    cursor: properties.cursor,
    outlineColor: properties.outlineColor,
    outlineStyle: properties.outlineStyle,
    outlineWidth: properties.outlineWidth,
    pointerEvents: properties.pointerEvents,
    textDecoration: properties.textDecoration
  }
});

export const mapPseudoConditionalValue = createMapValueFn(pseudoConditionalProperties);
export const normalizePseudoConditionalValue = createNormalizeValueFn(pseudoConditionalProperties);

export type PseudoCondition = 'default' | keyof typeof pseudoConditions;

export type PseudoConditionalValue<Value extends string | number> = ConditionalValue<
  typeof pseudoConditionalProperties,
  Value
>;

export const unconditionalProperties = defineProperties({
  properties: {
    appearance: properties.appearance,
    backgroundImage: properties.backgroundImage,
    backgroundPosition: properties.origin,
    backgroundRepeat: properties.backgroundRepeat,
    borderBottomStyle: properties.borderStyle,
    borderLeftStyle: properties.borderStyle,
    borderRightStyle: properties.borderStyle,
    borderTopStyle: properties.borderStyle,
    bottom: properties.inset,
    contain: properties.contain,
    containerType: properties.containerType,
    fontFamily: properties.fontFamily,
    left: properties.inset,
    listStyleType: properties.listStyleType,
    marginBottom: properties.margin,
    marginLeft: properties.margin,
    marginRight: properties.margin,
    marginTop: properties.margin,
    objectFit: properties.objectFit,
    objectPosition: properties.origin,
    outlineOffset: properties.spacing,
    overscrollBehavior: properties.overscrollBehavior,
    right: properties.inset,
    textOverflow: properties.textOverflow,
    top: properties.inset,
    transformOrigin: properties.origin,
    transitionProperty: properties.transitionProperty,
    transitionTimingFunction: properties.transitionTimingFunction,
    whiteSpace: properties.whiteSpace,
    wordBreak: properties.wordBreak,
    willChange: properties.transitionProperty
  },
  shorthands: {
    borderStyle: ['borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle'],
    borderStyleBlock: ['borderTopStyle', 'borderBottomStyle'],
    borderStyleInline: ['borderLeftStyle', 'borderRightStyle'],
    inset: ['top', 'right', 'bottom', 'left'],
    insetX: ['left', 'right'],
    insetY: ['top', 'bottom'],
    margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    marginBlock: ['marginTop', 'marginBottom'],
    marginInline: ['marginLeft', 'marginRight']
  }
});

export const sprinkles = createSprinkles(
  containerSizeAndMediaAndPseudoConditionalProperties,
  containerSizeAndPseudoConditionalProperties,
  containerSizeConditionalProperties,
  mediaAndPseudoConditionalProperties,
  pseudoConditionalProperties,
  unconditionalProperties
);
