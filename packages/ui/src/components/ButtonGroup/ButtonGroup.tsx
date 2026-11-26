import type { DesignSystem } from '../../styles/design-system.js';
import type { ButtonProps } from '../Button/Button.js';
import type { Elevation } from '../Surface/props/Elevation.js';

import {
  Children,
  cloneElement,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode
} from 'react';

import { Box } from '../Box/Box.js';
import { Button } from '../Button/Button.js';
import { Columns } from '../Columns/Columns.js';
import { Stack } from '../Stack/Stack.js';
import * as elevationMaps from '../Surface/elevationMaps.js';

function isButtonElement(child: ReactElement): child is ReactElement<ButtonProps> {
  return child.type === Button;
}

function getWidthProps(groupOrientation: 'horizontal' | 'vertical') {
  return { width: groupOrientation === 'horizontal' ? 'fit-content' : 'full' } satisfies Pick<ButtonProps, 'width'>;
}

function addProps(children: ReactNode, groupOrientation: 'horizontal' | 'vertical'): ReactNode[] | null | undefined {
  return Children.map(children, child => {
    if (!isValidElement(child)) return child;

    if (isButtonElement(child)) {
      return cloneElement(child, getWidthProps(groupOrientation));
    }

    return child;
  });
}

type Props = PropsWithChildren<{
  elevation?: Elevation | undefined;
  orientation?: 'horizontal' | 'vertical';
  width?: DesignSystem['width'] | undefined;
}>;

export function ButtonGroup({ children, elevation, orientation = 'horizontal', width }: Props) {
  const content = addProps(children, orientation);

  return (
    <Box
      backgroundColor={elevation ? elevationMaps.backgroundColor[elevation] : undefined}
      width={width ?? (orientation === 'horizontal' ? 'fit-content' : 'max-content')}
    >
      {orientation === 'horizontal' ? (
        <Columns justifyContent='space-between'>{content}</Columns>
      ) : (
        <Stack>{content}</Stack>
      )}
    </Box>
  );
}
