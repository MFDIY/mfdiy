import type { Type } from './props/Type.js';
import type { DesignSystem } from '../../styles/design-system.js';

import { useMergeRefs } from '@floating-ui/react';
import { useRef, useState, type ChangeEvent, type Ref } from 'react';

import { useRestProps } from '../../hooks/useRestProps/useRestProps.js';
import { designSystem } from '../../styles/design-system.js';
import { Box, type IntrinsicProps as BoxIntrinsicProps } from '../Box/Box.js';
import { fieldBoxClass, fieldButtonClass } from '../Field/fieldStyles.js';
import { Icon } from '../Icon/Icon.js';
import * as textStyles from '../Text/Text.css.js';

import * as styles from './TextInput.css.js';

export { types } from './props/Type.js';

export const supportedStyleProps = ['textAlign'] as const satisfies (keyof DesignSystem)[];

type SupportedStyleProp = (typeof supportedStyleProps)[number];

type StyleProps = Pick<DesignSystem, SupportedStyleProp>;

const inputClass = designSystem({
  appearance: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'hidden',
  color: { default: 'text', placeholder: 'text.faint', disabled: 'text.faint' },
  cursor: { default: 'text', disabled: 'not-allowed' },
  flexGrow: '1',
  fontFamily: 'regular',
  minWidth: 'none',
  outlineStyle: 'none',
  paddingInline: '3x',
  textOverflow: 'ellipsis'
});

export type TextInputProps = StyleProps &
  Omit<BoxIntrinsicProps<'input'>, 'children' | 'size' | 'type'> & {
    /** Names the clear button for assistive technology. */
    clearLabel?: string | undefined;
    /** Turns the border red. Explain the problem with a `Field` or next to the input. */
    error?: boolean | undefined;
    /** Shows a button that clears the input while it has text, and calls this. */
    onClear?: (() => void) | undefined;
    ref?: Ref<HTMLInputElement> | undefined;
    /** The `type` of the `input` element. */
    type?: Type | undefined;
  };

/**
 * A bare text input, without a label of its own; give it an `aria-label`. Its clear button sits in
 * the same box, like NumberField's buttons. Use `TextField` for a labelled field.
 */
export function TextInput({
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  className,
  clearLabel = 'Clear',
  defaultValue,
  disabled = false,
  error = false,
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
      disabled,
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
    if (inputRef.current && value === undefined) {
      inputRef.current.value = '';
    }

    inputRef.current?.focus();
    setQuery('');
    onClear?.();
  }

  return (
    <Box className={fieldBoxClass({ disabled, invalid: error, open: false })}>
      <Box
        {...nativeProps}
        aria-describedby={ariaDescribedBy}
        aria-invalid={error || undefined}
        aria-label={ariaLabel}
        aria-labelledby={typeof ariaLabel === 'undefined' ? ariaLabelledBy : undefined}
        className={[
          textStyles.variants['body'],
          styles.removeNativeDecoration,
          inputClass,
          designSystemClassNames,
          className
        ]}
        id={id}
        onChange={handleChange}
        ref={mergedRef}
        tagName='input'
      />
      {typeof onClear !== 'undefined' && !isEmpty && !disabled ? (
        <Box
          aria-label={clearLabel}
          className={fieldButtonClass}
          onClick={handleClear}
          onMouseDown={event => event.preventDefault()}
          tabIndex={-1}
          tagName='button'
          type='button'
        >
          <Icon name='close' />
        </Box>
      ) : null}
    </Box>
  );
}
