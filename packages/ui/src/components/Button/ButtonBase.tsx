import type { Size } from './props/Size.js';
import type { Width } from './props/Width.js';

import { useState, type FocusEvent, type KeyboardEvent, type PointerEvent, type PropsWithChildren } from 'react';

import { useRestProps } from '../../hooks/useRestProps/useRestProps.js';
import {
  mapContainerSizeAndMediaAndPseudoConditionalValue,
  mapContainerSizeConditionalValue,
  type ContainerSizeAndMediaAndPseudoConditionalValue,
  type ContainerSizeConditionalValue,
  type DesignSystem
} from '../../styles/design-system.js';
import { Box, type CssVariablesProp, type IntrinsicProps as BoxIntrinsicProps } from '../Box/Box.js';
import { Text } from '../Text/Text.js';

import * as styles from './ButtonBase.css.js';
import * as justifyContentMaps from './justifyContentMaps.js';
import * as sizeMaps from './sizeMaps.js';

export { widths } from './props/Width.js';

export const supportedStyleProps = [
  'backgroundColor',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'boxShadow',
  'color',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'justifyContent',
  'outlineStyle'
] as const satisfies (keyof DesignSystem)[];

type SupportedStyleProp = (typeof supportedStyleProps)[number];

type StyleProps = Pick<DesignSystem, SupportedStyleProp>;

export type ButtonBaseProps = BoxIntrinsicProps<'button'> &
  StyleProps &
  PropsWithChildren<{
    /**
     * Sets inline CSS Variables that are scoped to this button. Useful to pass information down to
     * nested components.
     */
    cssVariables?: CssVariablesProp | undefined;
    /** Sets the button size. */
    size?: ContainerSizeAndMediaAndPseudoConditionalValue<Size> | undefined;
    /** Sets the button width. */
    width?: ContainerSizeConditionalValue<Width> | undefined;
  }>;

export function ButtonBase({
  backgroundColor = 'transparent',
  borderBottomLeftRadius = '2x',
  borderBottomRightRadius = '2x',
  borderTopLeftRadius = '2x',
  borderTopRightRadius = '2x',
  boxShadow = 'none',
  children,
  className,
  color,
  cssVariables,
  disabled,
  flexBasis,
  flexGrow,
  flexShrink,
  justifyContent,
  onBlur,
  onKeyDown,
  onKeyUp,
  onLostPointerCapture,
  onPointerDown,
  outlineStyle = { default: 'none', focusVisible: 'solid' },
  ref,
  size = 'standard',
  type,
  width,
  ...restProps
}: ButtonBaseProps) {
  const [depressed, setDepressed] = useState<boolean>(false);

  const { nativeProps } = useRestProps(restProps, {
    nativeProps: {
      disabled: disabled || undefined,
      type: type ?? 'button'
    }
  });

  function handleBlur(event: FocusEvent<HTMLButtonElement>) {
    setDepressed(false);
    onBlur?.(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === ' ' && !disabled) setDepressed(true);
    onKeyDown?.(event);
  }

  function handleKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === ' ') setDepressed(false);
    onKeyUp?.(event);
  }

  function handleLostPointerCapture(event: PointerEvent<HTMLButtonElement>) {
    setDepressed(false);
    onLostPointerCapture?.(event);
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (!disabled) setDepressed(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    onPointerDown?.(event);
  }

  const height = mapContainerSizeAndMediaAndPseudoConditionalValue(size, s => `button.${s}`);
  const textVariant = mapContainerSizeAndMediaAndPseudoConditionalValue(size, s => `button.${s}`);
  const paddingBlock = mapContainerSizeAndMediaAndPseudoConditionalValue(size, s => sizeMaps.paddingBlock[s]);
  const paddingInline = mapContainerSizeAndMediaAndPseudoConditionalValue(size, s => sizeMaps.paddingInline[s]);

  const textAlign =
    typeof justifyContent === 'undefined'
      ? undefined
      : mapContainerSizeConditionalValue(justifyContent, j => justifyContentMaps.textAlign[j]);

  const textWidth =
    typeof justifyContent === 'undefined'
      ? undefined
      : mapContainerSizeConditionalValue(justifyContent, j => (j === 'center' ? 'auto' : 'full'));

  return (
    <Box
      {...nativeProps}
      alignItems='center'
      appearance='none'
      backgroundColor={backgroundColor}
      borderBottomLeftRadius={borderBottomLeftRadius}
      borderBottomRightRadius={borderBottomRightRadius}
      borderStyle='hidden'
      borderTopLeftRadius={borderTopLeftRadius}
      borderTopRightRadius={borderTopRightRadius}
      boxShadow={boxShadow}
      className={className}
      color={color}
      cssVariables={cssVariables}
      cursor={{ default: 'default', disabled: 'not-allowed' }}
      display='flex'
      flexBasis={flexBasis}
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      fontSize={textVariant}
      justifyContent='center'
      lineHeight='0'
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerDown={handlePointerDown}
      outlineColor='focus-ring'
      outlineOffset='none'
      outlineStyle={outlineStyle}
      outlineWidth='focus-ring'
      overflow='hidden'
      padding='none'
      position='relative'
      ref={ref}
      tagName='button'
      textAlign='center'
      textDecoration='none'
      transitionDuration={{ default: 'short', active: 'click' }}
      transitionProperty='button-surface'
      transitionTimingFunction='ease-out'
      width={width ?? 'fit-content'}
      willChange='button-surface'
    >
      <Box
        alignItems='center'
        className={[!children && styles.square, depressed && styles.depressed]}
        display='flex'
        flexGrow='1'
        gap='2x'
        height={height}
        justifyContent='center'
        lineHeight='0'
        paddingInline={children ? paddingInline : undefined}
        tagName='span'
        transitionDuration='click'
        transitionProperty='button-content'
        transitionTimingFunction='ease-out'
        width='full'
        willChange='button-content'
      >
        {children && (
          <Box paddingBlock={paddingBlock} textAlign={textAlign} width={textWidth}>
            <Text variant={textVariant} whiteSpace='nowrap'>
              {children}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
