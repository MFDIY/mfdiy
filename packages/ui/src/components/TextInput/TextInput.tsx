import type { Type } from './props/Type.js';
import type { DesignSystem } from '../../styles/design-system.js';
import type { Elevation } from '../Surface/props/Elevation.js';

import { useMergeRefs } from '@floating-ui/react';
import { useRef, useState, type ChangeEvent, type Ref } from 'react';

import { useRestProps } from '../../hooks/useRestProps/useRestProps.js';
import { Box, type IntrinsicProps as BoxIntrinsicProps } from '../Box/Box.js';
import { Button } from '../Button/Button.js';
import { Surface } from '../Surface/Surface.js';
import * as textStyles from '../Text/Text.css.js';

import * as styles from './TextInput.css.js';

export { elevations } from '../Surface/Surface.js';
export { types } from './props/Type.js';

export const supportedStyleProps = ['textAlign'] as const satisfies (keyof DesignSystem)[];

type SupportedStyleProp = (typeof supportedStyleProps)[number];

type StyleProps = Pick<DesignSystem, SupportedStyleProp>;

export type TextInputProps = StyleProps &
  Omit<BoxIntrinsicProps<'input'>, 'children' | 'size' | 'type'> & {
    /** Sets the elevation of the text input. */
    elevation?: Elevation | undefined;
    /** Displays an error focus ring around the text input. */
    error?: boolean | undefined;
    /** Keeps the border from brightening fully while focused, for a field that always has focus. */
    hideFocusRing?: boolean | undefined;
    /** Displays a clear button on the text input that calls the handler passed to this prop. */
    onClear?: (() => void) | undefined;
    ref?: Ref<HTMLInputElement> | undefined;
    /** The `type` of the `input` element. */
    type?: Type | undefined;
  };

export function TextInput({
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  className,
  defaultValue,
  elevation = 'base',
  error = false,
  hideFocusRing = false,
  id,
  onClear,
  onChange,
  ref,
  type = 'text',
  value,
  ...restProps
}: TextInputProps) {
  const [query, setQuery] = useState<string>(String(defaultValue ?? ''));

  const { designSystemClassNames, nativeProps } = useRestProps(restProps, {
    nativeProps: {
      autoCapitalize: autoCapitalize ?? 'off',
      autoComplete: autoComplete ?? 'off',
      autoCorrect: autoCorrect ?? 'off',
      defaultValue,
      type,
      value
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs([ref, inputRef]);

  // The parent can change a controlled value without the user typing.
  const isEmpty = String(value ?? query).length === 0;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    onChange?.(event);
  }

  function handleClear() {
    inputRef.current?.focus();
    setQuery('');
    onClear?.();
  }

  return (
    <Surface elevation={elevation} position='relative'>
      <Box
        {...nativeProps}
        appearance='none'
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-labelledby={typeof ariaLabel === 'undefined' ? ariaLabelledBy : undefined}
        backgroundColor='transparent'
        borderColor={
          error
            ? 'status.critical'
            : elevation === 'base'
              ? { default: 'line', hover: 'line.strong', focusVisible: hideFocusRing ? 'line.strong' : 'focus' }
              : 'transparent'
        }
        borderStyle='solid'
        borderWidth='hairline'
        className={[textStyles.variants['body'], styles.removeNativeDecoration, designSystemClassNames, className]}
        color={{
          default: 'text',
          placeholder: 'text.faint'
        }}
        fontFamily='regular'
        height='control'
        id={id}
        onChange={handleChange}
        outlineStyle='none'
        paddingLeft='3x'
        paddingRight={typeof onClear === 'undefined' ? '3x' : '6x'}
        ref={mergedRef}
        tagName='input'
        textOverflow='ellipsis'
        type={type}
        width='full'
      />
      {typeof onClear !== 'undefined' && !isEmpty && (
        <Box className={styles.clearButton} display='flex' insetY='none' position='absolute' right='none'>
          <Button
            aria-label='Clear'
            onClick={handleClear}
            onMouseDown={event => event.preventDefault()}
            tabIndex={-1}
            variant='quiet'
            width='full'
          >
            ✕
          </Button>
        </Box>
      )}
    </Surface>
  );
}
