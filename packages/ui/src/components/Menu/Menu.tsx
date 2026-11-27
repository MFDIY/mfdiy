import type { IconName } from '../Icon/Icon.js';
import type { ReactElement, ReactNode } from 'react';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useState } from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

/** A floating layer, so on the raised surface (0022). */
const popupClass = designSystem({
  backgroundColor: 'surface.raised',
  borderColor: 'line.strong',
  borderStyle: 'solid',
  borderWidth: 'hairline',
  color: 'text',
  outlineStyle: 'none'
});

const itemClass = ({ danger, disabled, highlighted }: { danger: boolean; disabled: boolean; highlighted: boolean }) =>
  designSystem({
    alignItems: 'center',
    backgroundColor: highlighted && !disabled ? (danger ? 'critical.hover' : 'hover') : 'transparent',
    color: disabled ? 'text.faint' : danger ? 'status.critical' : 'text',
    cursor: disabled ? 'not-allowed' : 'default',
    display: 'flex',
    gap: '3x',
    minHeight: 'control',
    outlineStyle: 'none',
    paddingInline: '3x',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  });

const separatorClass = designSystem({
  borderTopColor: 'line',
  borderTopStyle: 'solid',
  borderTopWidth: 'hairline'
});

/** The gap between the trigger and the menu, in pixels, as Base UI takes it. */
const OFFSET = 5;

export type MenuProps = {
  /** `MenuItem`s, with `MenuSeparator`s between groups. */
  children: ReactNode;
  /** Fires when the menu opens or closes, for anything else on the page that reacts to it. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Opens the menu, e.g. an `IconButton`. It has to take a `ref` and pass on the props it's given.
   * A function gets whether the menu is open, so the trigger can look different while it is.
   */
  trigger: ReactElement | ((open: boolean) => ReactElement);
};

/**
 * A list of actions that opens from a control, built on Base UI's Menu (0003): arrow keys move,
 * Enter chooses, typing jumps to an item, Escape closes.
 */
export function Menu({ children, onOpenChange, trigger }: MenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <BaseMenu.Root
      onOpenChange={next => {
        setOpen(next);
        onOpenChange?.(next);
      }}
      open={open}
    >
      <BaseMenu.Trigger render={typeof trigger === 'function' ? trigger(open) : trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner align='start' sideOffset={OFFSET}>
          <BaseMenu.Popup className={popupClass}>{children}</BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export type MenuItemProps = {
  /** What the item does. */
  children: string;
  /** Marks a destructive action, like Remove. */
  danger?: boolean | undefined;
  disabled?: boolean | undefined;
  /** An icon before the text. */
  icon?: IconName | undefined;
  onClick: () => void;
  /** A key that does the same, shown dimmed at the end, e.g. `+` for Zoom in. */
  shortcut?: string | undefined;
};

export function MenuItem({ children, danger = false, disabled = false, icon, onClick, shortcut }: MenuItemProps) {
  return (
    <BaseMenu.Item
      className={state => itemClass({ danger, disabled, highlighted: state.highlighted })}
      disabled={disabled}
      label={children}
      onClick={onClick}
    >
      {icon ? <Icon name={icon} /> : null}
      <Text variant='body'>{children}</Text>
      {shortcut ? (
        <Box color={disabled ? 'text.faint' : 'text.dim'} marginLeft='auto' paddingLeft='4x' tagName='kbd'>
          <Text variant='body'>{shortcut}</Text>
        </Box>
      ) : null}
    </BaseMenu.Item>
  );
}

/** A hairline between groups of items. */
export function MenuSeparator() {
  return <BaseMenu.Separator className={separatorClass} />;
}
