import type { Spacing } from './props/Spacing.js';
import type { ContainerSizeCondition, ContainerSizeConditionalValue } from '../../styles/design-system.js';

import { useMemo } from 'react';

import { normalizeContainerSizeConditionalValue } from '../../styles/sprinkles.css.js';

import { marginBottom, marginLeft, marginRight, marginTop } from './Bleed.css.js';

const bleedStyles = { marginBottom, marginLeft, marginRight, marginTop } as const;

export function useNegativeMargin(
  prop: ContainerSizeConditionalValue<Spacing> | undefined,
  key: 'marginBottom' | 'marginLeft' | 'marginRight' | 'marginTop'
): Array<string> {
  return useMemo(() => {
    if (typeof prop === 'undefined') return [];

    /* Instantiate an array of class names. */
    const classNames: Array<string> = [];

    /* Ensure prop value is an object. */
    const normalizedPropValue = normalizeContainerSizeConditionalValue(prop);

    /* Loop over all breakpoints and construct a class name for every breakpoint found. */
    Object.entries(normalizedPropValue).forEach(([size, bleed]) => {
      classNames.push(bleedStyles[key][bleed][size as ContainerSizeCondition]);
    }, []);

    return classNames;
  }, [key, prop]);
}
