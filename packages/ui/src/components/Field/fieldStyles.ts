import { designSystem } from '../../styles/design-system.js';

type FieldBoxState = {
  disabled: boolean;
  invalid: boolean;
  /** Something the field opened, like a Select's list, is showing. */
  open: boolean;
};

/**
 * The hairline box around a field's parts, e.g. a number and its − and + buttons. Its border
 * brightens on hover and stays bright while anything in it has focus, is pressed, or is open.
 */
export const fieldBoxClass = ({ disabled, invalid, open }: FieldBoxState) =>
  designSystem({
    alignItems: 'stretch',
    borderColor: invalid
      ? 'status.critical'
      : open
        ? 'focus'
        : { default: 'line', hover: 'line.strong', active: 'focus', focusWithin: 'focus', disabled: 'line' },
    borderStyle: disabled ? 'dashed' : 'solid',
    borderWidth: 'hairline',
    display: 'flex',
    height: 'control',
    width: 'full'
  });

/**
 * A square button inside a field's box, like NumberField's − and + or a clear button. A hairline in
 * the box's border colour separates it, so it brightens with the border.
 */
export const fieldButtonClass = designSystem({
  alignItems: 'center',
  appearance: 'none',
  backgroundColor: { default: 'transparent', hover: 'hover', active: 'pressed', disabled: 'transparent' },
  borderBottomStyle: 'hidden',
  borderLeftColor: 'inherit',
  borderLeftStyle: 'solid',
  borderLeftWidth: 'hairline',
  borderRightStyle: 'hidden',
  borderTopStyle: 'hidden',
  color: { default: 'text', disabled: 'text.faint' },
  cursor: { default: 'default', disabled: 'not-allowed' },
  display: 'flex',
  flexShrink: '0',
  justifyContent: 'center',
  outlineStyle: 'none',
  padding: 'none',
  width: 'control'
});
