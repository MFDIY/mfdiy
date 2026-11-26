import type { IconName } from '../Icon/Icon.js';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useId } from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Field } from '../Field/Field.js';
import { fieldBoxClass } from '../Field/fieldStyles.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

import * as styles from './SegmentedControl.css.js';

/** How the chosen segment stands out. Temporary: two of the three go once the maintainer has chosen. */
export const appearances = ['tint', 'inverted', 'underline'] as const;

export type Appearance = (typeof appearances)[number];

const segmentClass = ({ appearance, checked, first }: { appearance: Appearance; checked: boolean; first: boolean }) =>
  [
    designSystem({
      alignItems: 'center',
      appearance: 'none',
      backgroundColor: checked
        ? appearance === 'tint'
          ? 'pressed'
          : appearance === 'inverted'
            ? 'accent'
            : 'transparent'
        : { default: 'transparent', hover: 'hover', active: 'pressed', disabled: 'transparent' },
      borderBottomStyle: 'hidden',
      borderLeftColor: 'inherit',
      borderLeftStyle: first ? 'hidden' : 'solid',
      borderLeftWidth: 'hairline',
      borderRightStyle: 'hidden',
      borderTopStyle: 'hidden',
      color: checked
        ? appearance === 'inverted'
          ? 'accent.text'
          : 'text'
        : { default: 'text.dim', hover: 'text', disabled: 'text.faint' },
      cursor: { default: 'default', disabled: 'not-allowed' },
      display: 'flex',
      flexBasis: 'fluid',
      flexGrow: '1',
      gap: '2x',
      justifyContent: 'center',
      minWidth: 'none',
      outlineColor: 'focus',
      outlineOffset: 'none',
      outlineStyle: { default: 'none', focusVisible: 'solid' },
      outlineWidth: 'focus',
      paddingInline: '2x',
      userSelect: 'none',
      whiteSpace: 'nowrap'
    }),
    appearance === 'underline' ? styles.underline : undefined
  ]
    .filter(Boolean)
    .join(' ');

export type SegmentedControlItem = {
  /** An icon before the label. */
  icon?: IconName | undefined;
  label: string;
  value: string;
};

export type SegmentedControlProps = {
  /** How the chosen segment stands out. Temporary, while the three are compared. */
  appearance?: Appearance | undefined;
  /** Explains the field, under it. */
  description?: string | undefined;
  disabled?: boolean | undefined;
  /** Explains what's wrong with the choice. Shown under the field, which turns red. */
  error?: string | undefined;
  /** Two to four short options; use `Select` for more. */
  items: readonly SegmentedControlItem[];
  label: string;
  /** Fires with the chosen item's value. */
  onChange: (value: string) => void;
  /** The chosen item's value, or `null` for none yet. */
  value: string | null;
};

/**
 * A labelled choice of one from a few options, all in view, built on Base UI's RadioGroup (0003):
 * arrow keys move the choice. Segments share one hairline box and the field's width equally.
 * Controlled: the page owns the value.
 */
export function SegmentedControl({
  appearance = 'tint',
  description,
  disabled = false,
  error,
  items,
  label,
  onChange,
  value
}: SegmentedControlProps) {
  const id = useId();

  return (
    <Field description={description} disabled={disabled} error={error} label={label}>
      <RadioGroup
        className={fieldBoxClass({ disabled, invalid: Boolean(error), open: false })}
        disabled={disabled}
        onValueChange={next => {
          if (typeof next === 'string') {
            onChange(next);
          }
        }}
        value={value}
      >
        {items.map((item, index) => (
          <Radio.Root
            aria-labelledby={`${id}-${index}`}
            className={state => segmentClass({ appearance, checked: state.checked, first: index === 0 })}
            key={item.value}
            value={item.value}
          >
            {item.icon ? <Icon name={item.icon} /> : null}
            <Text id={`${id}-${index}`} truncate variant='body'>
              {item.label}
            </Text>
          </Radio.Root>
        ))}
      </RadioGroup>
    </Field>
  );
}
