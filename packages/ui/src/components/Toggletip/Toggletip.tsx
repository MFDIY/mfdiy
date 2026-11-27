import { Popover } from '@base-ui/react/popover';

import { designSystem } from '../../styles/design-system.js';
import { Icon } from '../Icon/Icon.js';
import { Text } from '../Text/Text.js';

import * as styles from './Toggletip.css.js';

const triggerClass = [
  designSystem({
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    borderStyle: 'hidden',
    color: { default: 'text.dim', hover: 'text', active: 'text', focusVisible: 'text' },
    cursor: 'default',
    display: 'inline-flex',
    flexShrink: '0',
    justifyContent: 'center',
    outlineColor: 'focus',
    outlineOffset: 'focus',
    outlineStyle: { default: 'none', focusVisible: 'solid' },
    outlineWidth: 'focus',
    padding: 'none'
  }),
  styles.trigger
].join(' ');

/** A floating layer, so on the raised surface (0022). */
const popupClass = designSystem({
  backgroundColor: 'surface.raised',
  borderColor: 'line.strong',
  borderStyle: 'solid',
  borderWidth: 'hairline',
  color: 'text',
  maxWidth: 'panel',
  outlineStyle: 'none',
  paddingBlock: '2x',
  paddingInline: '3x'
});

/** The gap between the button and its hint, in pixels, as Base UI takes it. */
const OFFSET = 5;

/** How long the pointer rests on the button before the hint opens, in milliseconds. */
const DELAY = 200;

export type ToggletipProps = {
  /** The hint. */
  children: string;
  /** Names the button for assistive technology, e.g. "About Grid". */
  label: string;
};

/**
 * A hint behind a small info button, built on Base UI's Popover (0003, 0022): it opens on hover
 * with a mouse, and on a tap or Enter, which also closes it, as do Escape and a press elsewhere.
 * The hint shows above the button, or below it where there's no room above.
 * Unlike a tooltip it works on touch screens. It holds hints only, never something the user must
 * see, like an error. Put it next to what it explains, such as a label; a field keeps the same text
 * as its description for assistive technology. The icon stays small; its hit area is a control's
 * size, without taking up that room.
 */
export function Toggletip({ children, label }: ToggletipProps) {
  return (
    <Popover.Root>
      <Popover.Trigger aria-label={label} className={triggerClass} delay={DELAY} openOnHover>
        <Icon name='info' size='small' />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner className={styles.positioner} side='top' sideOffset={OFFSET}>
          <Popover.Popup className={popupClass}>
            <Text variant='body'>{children}</Text>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
