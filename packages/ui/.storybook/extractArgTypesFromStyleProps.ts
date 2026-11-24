import type { ArgType } from './ArgType.js';
import type { DesignSystem } from '../src/styles/design-system.js';

import { cssPropertyDescriptions } from './cssPropertyDescriptions.js';

type ApproxDefinePropertiesReturnType = {
  conditions:
    | {
        defaultCondition: number | string;
        conditionNames: (number | string)[];
      }
    | undefined;
  styles: {
    [property: string]:
      | {
          mappings?: never;
          values: { [value: string]: unknown };
        }
      | {
          mappings: string[];
          values?: never;
        };
  };
};

type ArgTypes = Record<keyof DesignSystem, ArgType>;

type ArgData = {
  description: string;
  values: string[];
};

export function extractArgTypesFromStyleProps(...args: ApproxDefinePropertiesReturnType[]): ArgTypes {
  let combinedProperties: Record<string, ArgData> = {};

  for (const vanillaExtractProperties of args) {
    const conditions =
      typeof vanillaExtractProperties.conditions === 'undefined'
        ? 'Unconditional style prop.'
        : `Supported conditions:\n\n${vanillaExtractProperties.conditions.conditionNames
            .map(condition => (Number.isNaN(Number(condition)) ? `\`'${condition}'\`` : `\`${condition}\``))
            .join(' ')}`;

    const commonDescription = `${conditions}\n\nSupported values:`;

    combinedProperties = {
      ...combinedProperties,
      ...Object.fromEntries(
        Object.entries(vanillaExtractProperties.styles).map(([property, styles]) => {
          let data: ArgData;

          const description = cssPropertyDescriptions[property as keyof typeof cssPropertyDescriptions];

          if ('values' in styles) {
            data = {
              description: [description, commonDescription].filter(Boolean).join('\n\n'),
              values: Object.keys(styles.values)
            };
          } else {
            data = {
              description: [description, commonDescription].filter(Boolean).join('\n\n'),
              values: styles.mappings.reduce<string[]>(
                (values, mappedProperty) => [
                  ...values,
                  ...Object.keys(vanillaExtractProperties.styles[mappedProperty]?.values ?? {})
                ],
                []
              )
            };
          }

          return [property, data];
        })
      )
    };
  }

  return Object.fromEntries(
    Object.entries(combinedProperties)
      .map(([property, data]) => [
        property,
        {
          description: data.description,
          control: 'select',
          options: [undefined, ...data.values],
          table: {
            category: 'Style Props',
            type: {
              summary: data.values.map(value => (Number.isNaN(Number(value)) ? `'${value}'` : value)).join(' | ')
            }
          }
        } satisfies ArgType
      ])
      .sort((a, b) => ((a as [string, ArgType])[0] < (b as [string, ArgType])[0] ? -1 : 1))
  );
}
