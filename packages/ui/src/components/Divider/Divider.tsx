import type { DesignSystem } from '../../styles/design-system.js';

import { Box, type BoxProps } from '../Box/Box.js';

export type DividerProps = {
  className?: BoxProps<'hr'>['className'] | undefined;
  /** The divider colour. */
  color?: DesignSystem['borderColor'] | undefined;
};

export function Divider({ className, color = 'divider' }: DividerProps) {
  return (
    <Box
      alignSelf='stretch'
      borderBottomColor={color}
      borderBottomStyle='solid'
      borderLeftStyle='hidden'
      borderRightColor={color}
      borderRightStyle='solid'
      borderTopStyle='hidden'
      borderWidth='divider'
      className={className}
      margin='none'
      tagName='hr'
    />
  );
}
