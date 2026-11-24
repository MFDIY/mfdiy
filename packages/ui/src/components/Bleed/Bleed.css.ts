import type { Spacing } from './props/Spacing.js';

import { styleVariants, type ComplexStyleRule } from '@vanilla-extract/css';

import { spacing } from '../../styles/properties.js';
import { containerSizeConditionalProperties, type ContainerSizeCondition } from '../../styles/sprinkles.css.js';

function negate<T extends keyof typeof spacing>(value: (typeof spacing)[T]) {
  return `calc(${value} * -1)`;
}

const PSEUDO_BOTTOM = { '::after': { content: '""', display: 'table' } } as const satisfies ComplexStyleRule;
const PSEUDO_TOP = { '::before': { content: '""', display: 'table' } } as const satisfies ComplexStyleRule;

function createNegativeMarginStyleVariants(property: 'marginBottom' | 'marginLeft' | 'marginRight' | 'marginTop') {
  const pseudoStyles = {
    ...(property === 'marginBottom' ? PSEUDO_BOTTOM : undefined),
    ...(property === 'marginTop' ? PSEUDO_TOP : undefined)
  };

  return Object.keys(spacing)
    .filter(bleed => bleed !== 'auto')
    .reduce(
      (bleeds, bleed) => ({
        ...bleeds,
        [bleed]: styleVariants(
          containerSizeConditionalProperties.conditions.conditionNames.reduce(
            (sizes, size) => ({
              ...sizes,
              [size]: [
                size === 'default'
                  ? { ...pseudoStyles, [property]: negate(spacing[bleed as Spacing]) }
                  : ({
                      ...pseudoStyles,
                      '@container': {
                        [`(inline-size >= ${size}px)`]: {
                          [property]: negate(spacing[bleed as Spacing])
                        }
                      }
                    } as const satisfies ComplexStyleRule)
              ]
            }),
            {} as Record<ContainerSizeCondition, ComplexStyleRule>
          )
        )
      }),
      {} as Record<Spacing, Record<ContainerSizeCondition, string>>
    );
}

export const marginBottom = createNegativeMarginStyleVariants('marginBottom');
export const marginLeft = createNegativeMarginStyleVariants('marginLeft');
export const marginRight = createNegativeMarginStyleVariants('marginRight');
export const marginTop = createNegativeMarginStyleVariants('marginTop');
