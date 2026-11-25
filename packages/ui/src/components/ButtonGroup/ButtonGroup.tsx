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

function isButtonElement(child: ReactElement): child is ReactElement<ButtonProps> {
  return child.type === Button;
}

function countButtons(children: ReactNode): number {
  return Children.toArray(children).filter(child => isValidElement(child) && isButtonElement(child)).length;
}

function getRadiusProps(groupOrientation: 'horizontal' | 'vertical', groupLength: number, groupIndex: number) {
  switch (groupOrientation) {
    case 'horizontal': {
      return {
        borderTopLeftRadius: groupIndex === 0 ? undefined : 'none',
        borderBottomLeftRadius: groupIndex === 0 ? undefined : 'none',
        borderTopRightRadius: groupIndex === groupLength - 1 ? undefined : 'none',
        borderBottomRightRadius: groupIndex === groupLength - 1 ? undefined : 'none',
        width: 'fit-content'
      } satisfies DesignSystem;
    }

    case 'vertical': {
      return {
        borderTopLeftRadius: groupIndex === 0 ? undefined : 'none',
        borderTopRightRadius: groupIndex === 0 ? undefined : 'none',
        borderBottomLeftRadius: groupIndex === groupLength - 1 ? undefined : 'none',
        borderBottomRightRadius: groupIndex === groupLength - 1 ? undefined : 'none',
        width: 'full'
      } satisfies DesignSystem;
    }
  }
}

function addProps(
  children: ReactNode,
  groupOrientation: 'horizontal' | 'vertical',
  groupLength: number
): ReactNode[] | null | undefined {
  let buttonIndex = 0;

  return Children.map(children, child => {
    if (!isValidElement(child)) return child;

    if (isButtonElement(child)) {
      return cloneElement(child, getRadiusProps(groupOrientation, groupLength, buttonIndex++));
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
  const groupLength = countButtons(children);
  const content = addProps(children, orientation, groupLength);

  return (
    <Box
      backgroundColor={elevation ? `elevation.${elevation}` : undefined}
      borderRadius='2x'
      boxShadow={elevation ? `elevation.${elevation}` : undefined}
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
