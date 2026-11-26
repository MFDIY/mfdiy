import type { ReactElement } from 'react';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

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
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={OFFSET}>
          <BaseTooltip.Popup className={popupClass}>
            <Text variant='body'>{label}</Text>
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
