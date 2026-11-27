import { Select as BaseSelect } from '@base-ui/react/select';
import { useRef, useState } from 'react';

import { usePopupLayer } from '../../contexts/PopupLayer/popupLayer.js';
import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Field } from '../Field/Field.js';
import { fieldBoxClass, fieldButtonClass } from '../Field/fieldStyles.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

import * as styles from './Select.css.js';

/** The part that opens the list, filled on hover like the buttons beside it; the field box draws the border. */
const triggerClass = designSystem({
  alignItems: 'center',
  appearance: 'none',
  backgroundColor: { default: 'transparent', hover: 'hover', active: 'pressed', disabled: 'transparent' },
  borderStyle: 'hidden',
  color: { default: 'text', disabled: 'text.faint' },
  cursor: { default: 'default', disabled: 'not-allowed' },
  display: 'flex',
  flexGrow: '1',
  fontFamily: 'inherit',
  gap: '2x',
  minWidth: 'none',
  outlineStyle: 'none',
  paddingLeft: '3x',
  paddingRight: '2x'
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
  /** Shows a button that clears the choice while there is one. */
  clearable?: boolean | undefined;
  /** Explains the field: a hint in a toggletip by the label (0022). */
  description?: string | undefined;
  disabled?: boolean | undefined;
  /** Explains what's wrong with the choice. Shown under the field, which turns red. */
  error?: string | undefined;
  items: readonly SelectItem[];
  label: string;
  /** Fires with the chosen item's value, or `null` when the choice is cleared. */
  onChange: (value: string | null) => void;
  /** Shown while nothing is chosen. */
  placeholder?: string | undefined;
  /** The chosen item's value, or `null` for none. */
  value: string | null;
};

/**
 * A labelled choice from a short, fixed list, built on Base UI's Select (0003). Closed, it looks like
 * a text field; open, its list drops below it like a menu, the chosen item ticked. Arrow keys move,
 * typing jumps to an item. Clearable, a button beside it empties the choice. Controlled: the page
 * owns the value.
 */
export function Select({
  clearable = false,
  description,
  disabled = false,
  error,
  items,
  label,
  onChange,
  placeholder,
  value
}: SelectProps) {
  const layer = usePopupLayer();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Field description={description} disabled={disabled} error={error} label={label}>
      <BaseSelect.Root
        disabled={disabled}
        items={items}
        onOpenChange={setOpen}
        onValueChange={next => {
          if (typeof next === 'string') {
            onChange(next);
          }
        }}
        value={value}
      >
        <Box className={fieldBoxClass({ disabled, invalid: Boolean(error), open })} ref={boxRef}>
          <BaseSelect.Trigger className={triggerClass} ref={triggerRef}>
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
          {clearable && value !== null && !disabled ? (
            <Box
              aria-label='Clear'
              className={fieldButtonClass}
              onClick={() => {
                onChange(null);
                triggerRef.current?.focus();
              }}
              tagName='button'
              type='button'
            >
              <Icon name='close' />
            </Box>
          ) : null}
        </Box>
        <BaseSelect.Portal {...layer.portal}>
          <BaseSelect.Positioner {...layer.positioner} alignItemWithTrigger={false} anchor={boxRef} sideOffset={OFFSET}>
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
