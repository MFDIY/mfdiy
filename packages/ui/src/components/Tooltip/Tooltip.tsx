import type { ReactElement, ReactNode } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

import { usePopupLayer } from '../../contexts/PopupLayer/popupLayer.js';
import { designSystem } from '../../styles/design-system.js';
import { Text } from '../Text/Text.js';

/** A floating layer, so on the raised surface (0022). */
const popupClass = designSystem({
  backgroundColor: 'surface.raised',
  borderColor: 'line.strong',
  borderStyle: 'solid',
  borderWidth: 'hairline',
  color: 'text',
  paddingBlock: '1x',
  paddingInline: '2x',
  pointerEvents: 'none'
});

/** The gap between a control and its tooltip, in pixels, as Base UI takes it. */
const OFFSET = 5;

export type TooltipProps = {
  /** The control. It has to take a `ref` and pass on the props it's given, like `Button`. */
  children: ReactElement;
  /** What the tooltip says: the name of the control it's for. */
  label: string;
};

/**
 * Names a control on hover with a mouse or pen, and on keyboard focus; never on touch. Built on
 * Base UI's Tooltip (0003). It only shows a name: give the control its own accessible name too.
 */
export function Tooltip({ children, label }: TooltipProps) {
  const layer = usePopupLayer();

  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal {...layer.portal}>
        <BaseTooltip.Positioner {...layer.positioner} sideOffset={OFFSET}>
          <BaseTooltip.Popup className={popupClass}>
            <Text variant='body'>{label}</Text>
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export type TooltipGroupProps = {
  /** Controls with their own `Tooltip`s. */
  children: ReactNode;
};

/**
 * Groups neighbouring controls' tooltips, such as a row of tabs: once one has shown, moving to the
 * next shows its tooltip straight away. Built on Base UI's Tooltip.Provider (0003).
 */
export function TooltipGroup({ children }: TooltipGroupProps) {
  return <BaseTooltip.Provider>{children}</BaseTooltip.Provider>;
}
