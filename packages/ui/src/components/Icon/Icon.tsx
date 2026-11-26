import { Box } from '../Box/Box.js';

import { paths } from './paths.js';

export type IconName = keyof typeof paths;

export const iconNames = Object.keys(paths) as IconName[];

export type IconProps = {
  /** Names the icon for assistive technology. Leave out when the text or control around it says it already. */
  label?: string | undefined;
  name: IconName;
};

/**
 * A Material Symbol (Sharp, weight 300), in the colour of the text around it (0022). One size, made
 * for controls. Add one with `npm run icons -w @mfdiy/ui`.
 */
export function Icon({ label, name }: IconProps) {
  return (
    <Box
      aria-hidden={label ? undefined : true}
      aria-label={label}
      display='block'
      flexShrink='0'
      focusable='false'
      height='5x'
      role={label ? 'img' : undefined}
      tagName='svg'
      viewBox='0 -960 960 960'
      width='5x'
    >
      <Box d={paths[name]} fill='currentColor' tagName='path' />
    </Box>
  );
}
