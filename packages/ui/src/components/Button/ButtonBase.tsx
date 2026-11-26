import type { IconName } from '../Icon/Icon.js';
import type { IconPosition } from './props/IconPosition.js';
import type { Width } from './props/Width.js';

import { useState, type FocusEvent, type KeyboardEvent, type PointerEvent, type PropsWithChildren } from 'react';

import { useRestProps } from '../../hooks/useRestProps/useRestProps.js';
import {
  mapContainerSizeConditionalValue,
  type ContainerSizeConditionalValue,
  type DesignSystem
} from '../../styles/design-system.js';
import { Box, type CssVariablesProp, type IntrinsicProps as BoxIntrinsicProps } from '../Box/Box.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

import * as styles from './ButtonBase.css.js';
import * as justifyContentMaps from './justifyContentMaps.js';

export { widths } from './props/Width.js';

export const supportedStyleProps = [
  'backgroundColor',
  'borderColor',
  'color',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'justifyContent'
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
    /** An icon beside the text; without text, the button is square. Name an icon-only button with `aria-label`. */
    icon?: IconName | undefined;
    /** Puts the icon before the text (the default) or after it. */
    iconPosition?: IconPosition | undefined;
    /** Sets the button width. */
    width?: ContainerSizeConditionalValue<Width> | undefined;
  }>;

/**
 * A flat button with a hairline border and square corners; `Button` gives it a variant's colours.
 * One size: the shared control height, so buttons line up with fields (0022).
 */
export function ButtonBase({
  backgroundColor = 'transparent',
  borderColor = 'transparent',
  children,
  className,
  color,
  cssVariables,
  disabled,
  flexBasis,
  flexGrow,
  flexShrink,
  icon,
  iconPosition = 'leading',
  justifyContent,
  onBlur,
  onKeyDown,
  onKeyUp,
  onLostPointerCapture,
  onPointerDown,
  ref,
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
      borderColor={borderColor}
      borderStyle='solid'
      borderWidth='hairline'
      className={className}
      color={color}
      cssVariables={cssVariables}
      cursor={{ default: 'default', disabled: 'not-allowed' }}
      display='flex'
      flexBasis={flexBasis}
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      height='control'
      justifyContent='center'
      lineHeight='0'
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerDown={handlePointerDown}
      outlineColor='focus'
      outlineOffset='focus'
      outlineStyle={{ default: 'none', focusVisible: 'solid' }}
      outlineWidth='focus'
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
    >
      <Box
        alignItems='center'
        className={[!children && styles.square, depressed && styles.depressed]}
        display='flex'
        flexGrow='1'
        gap='2x'
        height='full'
        justifyContent='center'
        lineHeight='0'
        paddingInline={children ? '3x' : undefined}
        tagName='span'
        transitionDuration='click'
        transitionProperty='button-content'
        transitionTimingFunction='ease-out'
        width='full'
      >
        {icon && iconPosition === 'leading' ? <Icon name={icon} /> : null}
        {children && (
          <Box textAlign={textAlign} width={textWidth}>
            <Text variant='label' whiteSpace='nowrap'>
              {children}
            </Text>
          </Box>
        )}
        {icon && iconPosition === 'trailing' ? <Icon name={icon} /> : null}
      </Box>
    </Box>
  );
}
