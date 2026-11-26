import type { IconName } from '../Icon/Icon.js';

import { Button, type ButtonProps } from '../Button/Button.js';
import { Tooltip } from '../Tooltip/Tooltip.js';

export type IconButtonProps = Omit<ButtonProps, 'aria-label' | 'children' | 'icon' | 'iconPosition' | 'width'> & {
  icon: IconName;
  /** Names the button, for assistive technology and as its tooltip. */
  label: string;
};

/** A square button showing only an icon, named by a tooltip. Quiet by default, for toolbars. */
export function IconButton({ icon, label, variant = 'quiet', ...restProps }: IconButtonProps) {
  return (
    <Tooltip label={label}>
      <Button {...restProps} aria-label={label} icon={icon} variant={variant} />
    </Tooltip>
  );
}
