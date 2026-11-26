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

/*
 * Every value of every property is multiplied by every condition its group allows, so each property
 * sits in the smallest group that covers how it's used: layout responds to its container, colours
 * and interaction to the pointer and the element's state, and the rest to nothing.
 */

/** Layout: responds to the width of the nearest container. */
export const containerSizeConditionalProperties = defineProperties({
  conditions: {
    default: {},
    ...containerSizeConditions
  },
  defaultCondition: 'default',
  properties: {
    alignItems: properties.alignItems,
    alignSelf: properties.alignSelf,
    borderBottomLeftRadius: properties.borderRadius,
    borderBottomRightRadius: properties.borderRadius,
    borderTopLeftRadius: properties.borderRadius,
    borderTopRightRadius: properties.borderRadius,
    columnGap: properties.spacing,
    display: properties.display,
    flexBasis: properties.flexBasis,
    flexDirection: properties.flexDirection,
    flexGrow: properties.flexGrow,
    flexShrink: properties.flexShrink,
    flexWrap: properties.flexWrap,
    height: properties.height,
    justifyContent: properties.justifyContent,
    maxHeight: properties.height,
    maxWidth: properties.width,
    minHeight: properties.height,
    minWidth: properties.width,
    overflowX: properties.overflow,
    overflowY: properties.overflow,
    paddingBottom: properties.paddingBlock,
    paddingLeft: properties.paddingInline,
    paddingRight: properties.paddingInline,
    paddingTop: properties.paddingBlock,
    rowGap: properties.spacing,
    textAlign: properties.textAlign,
    width: properties.width
  },
  shorthands: {
    borderRadius: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'],
    borderBottomRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
    borderLeftRadius: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
    borderRightRadius: ['borderTopRightRadius', 'borderBottomRightRadius'],
    borderTopRadius: ['borderTopLeftRadius', 'borderTopRightRadius'],
    gap: ['rowGap', 'columnGap'],
    overflow: ['overflowX', 'overflowY'],
    padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    paddingBlock: ['paddingTop', 'paddingBottom'],
    paddingInline: ['paddingLeft', 'paddingRight']
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

/** Colour and interaction: responds to the pointer and to the element's state. */
export const mediaAndPseudoConditionalProperties = defineProperties({
  conditions: {
    default: {},
    ...mediaConditions,
    ...pseudoConditions
  },
  defaultCondition: 'default',
  properties: {
    backgroundColor: properties.backgroundColor,
    borderBottomColor: properties.borderColor,
    borderLeftColor: properties.borderColor,
    borderRightColor: properties.borderColor,
    borderTopColor: properties.borderColor,
    boxShadow: properties.boxShadow,
    color: properties.color,
    cursor: properties.cursor,
    opacity: properties.opacity,
    outlineColor: properties.outlineColor,
    outlineStyle: properties.outlineStyle,
    outlineWidth: properties.outlineWidth,
    pointerEvents: properties.pointerEvents,
    textDecoration: properties.textDecoration,
    touchAction: properties.touchAction,
    transform: properties.transform,
    transitionDuration: properties.transitionDuration,
    userSelect: properties.userSelect,
    visibility: properties.visibility
  },
  shorthands: {
    borderColor: ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'],
    borderColorX: ['borderLeftColor', 'borderRightColor'],
    borderColorY: ['borderTopColor', 'borderBottomColor']
  }
});

export const mapMediaAndPseudoConditionalValue = createMapValueFn(mediaAndPseudoConditionalProperties);
export const normalizeMediaAndPseudoConditionalValue = createNormalizeValueFn(mediaAndPseudoConditionalProperties);

export type MediaAndPseudoCondition = 'default' | keyof typeof mediaConditions | keyof typeof pseudoConditions;

export type MediaAndPseudoConditionalValue<Value extends string | number> = ConditionalValue<
  typeof mediaAndPseudoConditionalProperties,
  Value
>;

/** Everything else, including type: set per element, never per condition. */
export const unconditionalProperties = defineProperties({
  properties: {
    appearance: properties.appearance,
    backgroundImage: properties.backgroundImage,
    backgroundPosition: properties.origin,
    backgroundRepeat: properties.backgroundRepeat,
    borderBottomStyle: properties.borderStyle,
    borderBottomWidth: properties.borderWidth,
    borderLeftStyle: properties.borderStyle,
    borderLeftWidth: properties.borderWidth,
    borderRightStyle: properties.borderStyle,
    borderRightWidth: properties.borderWidth,
    borderTopStyle: properties.borderStyle,
    borderTopWidth: properties.borderWidth,
    bottom: properties.inset,
    contain: properties.contain,
    containerType: properties.containerType,
    fontFamily: properties.fontFamily,
    fontSize: properties.fontSize,
    fontWeight: properties.fontWeight,
    isolation: properties.isolation,
    left: properties.inset,
    letterSpacing: properties.letterSpacing,
    lineHeight: properties.lineHeight,
    listStyleType: properties.listStyleType,
    marginBottom: properties.margin,
    marginLeft: properties.margin,
    marginRight: properties.margin,
    marginTop: properties.margin,
    objectFit: properties.objectFit,
    objectPosition: properties.origin,
    outlineOffset: properties.outlineOffset,
    overscrollBehavior: properties.overscrollBehavior,
    position: properties.position,
    right: properties.inset,
    textOverflow: properties.textOverflow,
    textTransform: properties.textTransform,
    top: properties.inset,
    transformOrigin: properties.origin,
    transitionProperty: properties.transitionProperty,
    transitionTimingFunction: properties.transitionTimingFunction,
    whiteSpace: properties.whiteSpace,
    willChange: properties.transitionProperty,
    wordBreak: properties.wordBreak,
    zIndex: properties.zIndex
  },
  shorthands: {
    borderStyle: ['borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle'],
    borderStyleBlock: ['borderTopStyle', 'borderBottomStyle'],
    borderStyleInline: ['borderLeftStyle', 'borderRightStyle'],
    borderWidth: ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
    borderWidthX: ['borderLeftWidth', 'borderRightWidth'],
    borderWidthY: ['borderTopWidth', 'borderBottomWidth'],
    inset: ['top', 'right', 'bottom', 'left'],
    insetX: ['left', 'right'],
    insetY: ['top', 'bottom'],
    margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    marginBlock: ['marginTop', 'marginBottom'],
    marginInline: ['marginLeft', 'marginRight']
  }
});

export const sprinkles = createSprinkles(
  containerSizeConditionalProperties,
  mediaAndPseudoConditionalProperties,
  unconditionalProperties
);
