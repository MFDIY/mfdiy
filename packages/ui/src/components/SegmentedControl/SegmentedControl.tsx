import type { IconName } from '../Icon/Icon.js';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useId } from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Field } from '../Field/Field.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

/** A fixed frame: unlike a field's box, it doesn't light up, as each segment shows its own state. */
const frameClass = ({ disabled, invalid }: { disabled: boolean; invalid: boolean }) =>
  designSystem({
    alignItems: 'stretch',
    borderColor: invalid ? 'status.critical' : 'line',
    borderStyle: disabled ? 'dashed' : 'solid',
    borderWidth: 'hairline',
    display: 'flex',
    height: 'control',
    width: 'full'
  });

/** The chosen segment takes a faint tint and bright text; the others are dim until hovered. */
const segmentClass = ({ checked, first }: { checked: boolean; first: boolean }) =>
  designSystem({
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: checked
      ? 'pressed'
      : { default: 'transparent', hover: 'hover', active: 'pressed', disabled: 'transparent' },
    borderBottomStyle: 'hidden',
    borderLeftColor: 'inherit',
    borderLeftStyle: first ? 'hidden' : 'solid',
    borderLeftWidth: 'hairline',
    borderRightStyle: 'hidden',
    borderTopStyle: 'hidden',
    color: checked ? 'text' : { default: 'text.dim', hover: 'text', active: 'text', disabled: 'text.faint' },
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
  });

export type SegmentedControlItem = {
  /** An icon before the label. */
  icon?: IconName | undefined;
  label: string;
  value: string;
};

export type SegmentedControlProps = {
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
 * arrow keys move the choice. Segments share one fixed hairline frame and the field's width equally;
 * the chosen one is tinted (0022).
 * Controlled: the page owns the value.
 */
export function SegmentedControl({
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
        className={frameClass({ disabled, invalid: Boolean(error) })}
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
            className={state => segmentClass({ checked: state.checked, first: index === 0 })}
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
