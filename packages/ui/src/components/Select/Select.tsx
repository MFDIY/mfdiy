import { Select as BaseSelect } from '@base-ui/react/select';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Field } from '../Field/Field.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

import * as styles from './Select.css.js';

/** Like a text field; open, its border stays bright, as while it's focused. */
const triggerClass = ({ disabled, invalid, open }: { disabled: boolean; invalid: boolean; open: boolean }) =>
  designSystem({
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    borderColor: invalid
      ? 'status.critical'
      : open
        ? 'focus'
        : { default: 'line', hover: 'line.strong', active: 'focus', focusVisible: 'focus', disabled: 'line' },
    borderStyle: disabled ? 'dashed' : 'solid',
    borderWidth: 'hairline',
    color: { default: 'text', disabled: 'text.faint' },
    cursor: disabled ? 'not-allowed' : 'default',
    display: 'flex',
    fontFamily: 'inherit',
    gap: '2x',
    height: 'control',
    outlineStyle: 'none',
    paddingLeft: '3x',
    paddingRight: '2x',
    width: 'full'
  });

/** A floating layer, so on the raised surface (0022); its items sit flush. */
const popupClass = [
  designSystem({
    backgroundColor: 'surface.raised',
    borderColor: 'line.strong',
    borderStyle: 'solid',
    borderWidth: 'hairline',
    color: 'text',
    outlineStyle: 'none'
  }),
  styles.popup
].join(' ');

const itemClass = (highlighted: boolean) =>
  designSystem({
    alignItems: 'center',
    backgroundColor: highlighted ? 'hover' : 'transparent',
    cursor: 'default',
    display: 'flex',
    gap: '3x',
    justifyContent: 'space-between',
    minHeight: 'control',
    outlineStyle: 'none',
    paddingLeft: '3x',
    paddingRight: '2x',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  });

/** The gap between the control and its list, in pixels, as Base UI takes it. */
const OFFSET = 5;

export type SelectItem = {
  label: string;
  value: string;
};

export type SelectProps = {
  /** Explains the field, under it. */
  description?: string | undefined;
  disabled?: boolean | undefined;
  /** Explains what's wrong with the choice. Shown under the field, which turns red. */
  error?: string | undefined;
  items: readonly SelectItem[];
  label: string;
  /** Fires with the chosen item's value. */
  onChange: (value: string) => void;
  /** Shown while nothing is chosen. */
  placeholder?: string | undefined;
  /** The chosen item's value, or `null` for none. */
  value: string | null;
};

/**
 * A labelled choice from a short, fixed list, built on Base UI's Select (0003). Closed, it looks like
 * a text field; open, its list drops below it like a menu, the chosen item ticked. Arrow keys move,
 * typing jumps to an item. Controlled: the page owns the value.
 */
export function Select({
  description,
  disabled = false,
  error,
  items,
  label,
  onChange,
  placeholder,
  value
}: SelectProps) {
  return (
    <Field description={description} disabled={disabled} error={error} label={label}>
      <BaseSelect.Root
        disabled={disabled}
        items={items}
        onValueChange={next => {
          if (typeof next === 'string') {
            onChange(next);
          }
        }}
        value={value}
      >
        <BaseSelect.Trigger
          className={state => triggerClass({ disabled: state.disabled, invalid: Boolean(error), open: state.open })}
        >
          <Box flexGrow='1' minWidth='none' textAlign='left'>
            <BaseSelect.Value
              placeholder={placeholder}
              render={(props, state) => (
                <Text {...props} color={state.placeholder ? 'text.faint' : 'inherit'} truncate variant='body' />
              )}
            />
          </Box>
          <BaseSelect.Icon render={<Box color='text.dim' display='flex' />}>
            <Icon name='unfold_more' />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner alignItemWithTrigger={false} sideOffset={OFFSET}>
            <BaseSelect.Popup className={popupClass}>
              <BaseSelect.List>
                {items.map(item => (
                  <BaseSelect.Item
                    className={state => itemClass(state.highlighted)}
                    key={item.value}
                    value={item.value}
                  >
                    <BaseSelect.ItemText render={<Text variant='body' />}>{item.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator render={<Box display='flex' />}>
                      <Icon name='check' />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </Field>
  );
}
