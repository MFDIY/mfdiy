import type { ArgType } from './ArgType.js';

type VanillaExtractConditions =
  | {
      defaultCondition: number | string;
      conditionNames: (number | string)[];
    }
  | undefined;

export function createArgTypeFromConditionalStyleProp(
  values: Readonly<string[]>,
  vanillaExtractConditions: VanillaExtractConditions,
  defaultValue?: string
) {
  const conditions =
    typeof vanillaExtractConditions === 'undefined'
      ? 'Unconditional prop.'
      : `Supported conditions:\n\n${vanillaExtractConditions.conditionNames
          .map(condition => (Number.isNaN(Number(condition)) ? `\`'${condition}'\`` : `\`${condition}\``))
          .join(' ')}`;

  const description = `${conditions}\n\nSupported values:`;

  return {
    description,
    control: 'select',
    options: [undefined, ...values],
    table: {
      ...(typeof defaultValue === 'undefined' ? undefined : { defaultValue: { summary: defaultValue } }),
      type: {
        summary: values.map(value => (Number.isNaN(Number(value)) ? `'${value}'` : value)).join(' | ')
      }
    }
  } satisfies ArgType;
}
