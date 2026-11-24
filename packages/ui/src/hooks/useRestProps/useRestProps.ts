import { designSystem, type DesignSystem } from '../../styles/design-system.js';

type NativeProps = Record<string, unknown>;

type StyleProps = { [Key in keyof DesignSystem]?: DesignSystem[Key] };

type ParseRestPropsOptions = {
  nativeProps?: NativeProps;
  styleProps?: StyleProps;
};

type ParsedRestProps = {
  designSystemClassNames: string;
  nativeProps: NativeProps;
};

export function useRestProps(
  restProps: Record<string, unknown>,
  { styleProps = {}, nativeProps = {} }: ParseRestPropsOptions = {}
): ParsedRestProps {
  const clonedStyleProps = structuredClone(styleProps);
  const clonedNativeProps = structuredClone(nativeProps);

  for (const key in restProps) {
    if (designSystem.properties.has(key as keyof DesignSystem)) {
      const cssProperty = key as keyof DesignSystem;
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      /* @ts-ignore Suppress TS2590: Expression produces a union type that is too complex to represent. */
      clonedStyleProps[cssProperty] = restProps[key] as never;
    } else {
      clonedNativeProps[key] = restProps[key];
    }
  }

  const designSystemClassNames = designSystem(clonedStyleProps);

  return { designSystemClassNames, nativeProps: clonedNativeProps } as const;
}
