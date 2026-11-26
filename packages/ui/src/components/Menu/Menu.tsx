import type { IconName } from '../Icon/Icon.js';
import type { ReactElement, ReactNode } from 'react';

import { Menu as BaseMenu } from '@base-ui/react/menu';

import { designSystem } from '../../styles/design-system.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

/** A floating layer, so on the raised surface (0022). */
const popupClass = designSystem({
  backgroundColor: 'surface.raised',
  borderColor: 'line.strong',
  borderStyle: 'solid',
  borderWidth: 'hairline',
  color: 'text',
  outlineStyle: 'none',
  paddingBlock: '1x'
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
  borderTopWidth: 'hairline',
  marginBlock: '1x'
});

/** The gap between the trigger and the menu, in pixels, as Base UI takes it. */
const OFFSET = 5;

export type MenuProps = {
  /** Opens the menu, e.g. an `IconButton`. It has to take a `ref` and pass on the props it's given. */
  trigger: ReactElement;
  /** `MenuItem`s, with `MenuSeparator`s between groups. */
  children: ReactNode;
};

/**
 * A list of actions that opens from a control, built on Base UI's Menu (0003): arrow keys move,
 * Enter chooses, typing jumps to an item, Escape closes.
 */
export function Menu({ children, trigger }: MenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger} />
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
  onClick: () => void;
  /** An icon before the text. */
  icon?: IconName | undefined;
  /** Marks a destructive action, like Remove. */
  danger?: boolean | undefined;
  disabled?: boolean | undefined;
};

export function MenuItem({ children, danger = false, disabled = false, icon, onClick }: MenuItemProps) {
  return (
    <BaseMenu.Item
      className={state => itemClass({ danger, disabled, highlighted: state.highlighted })}
      disabled={disabled}
      label={children}
      onClick={onClick}
    >
      {icon ? <Icon name={icon} /> : null}
      <Text variant='body'>{children}</Text>
    </BaseMenu.Item>
  );
}

/** A hairline between groups of items. */
export function MenuSeparator() {
  return <BaseMenu.Separator className={separatorClass} />;
}
