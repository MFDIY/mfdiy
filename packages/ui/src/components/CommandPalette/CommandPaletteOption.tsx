import type { Command } from './Command.js';
import type { useInteractions } from '@floating-ui/react';

import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import * as styles from './CommandPalette.css.js';

export type CommandPaletteOptionProps = {
  command: Command;
  getItemProps: ReturnType<typeof useInteractions>['getItemProps'];
  id: string;
  isActive: boolean;
  itemRef: (node: HTMLElement | null) => void;
  onSelect: () => void;
};

export function CommandPaletteOption({
  command,
  getItemProps,
  id,
  isActive,
  itemRef,
  onSelect
}: CommandPaletteOptionProps) {
  const itemProps = getItemProps({
    onClick: onSelect,
    tabIndex: -1
  });

  return (
    <Box
      {...itemProps}
      alignItems='center'
      aria-selected={isActive}
      backgroundColor={isActive ? 'button.transparent-hover' : 'button.transparent'}
      boxShadow={isActive ? 'button.transparent-hover' : 'button.transparent'}
      color={isActive ? 'button.transparent-hover' : 'button.transparent'}
      columnGap='4x'
      display='flex'
      flexDirection='row'
      flexShrink='0'
      id={id}
      justifyContent='space-between'
      outlineStyle='none'
      paddingBlock='3x'
      paddingInline='4x'
      ref={itemRef}
      role='option'
      tagName='div'
      userSelect='none'
    >
      {command.preview ? (
        <Box aria-hidden borderRadius='1x' className={styles.preview} flexShrink='0' inert overflow='hidden'>
          {command.preview}
        </Box>
      ) : null}
      <Stack flexGrow='1' minWidth='none' spacing='2x'>
        <Text variant='command.label'>
          {command.label}
          {command.entity ? (
            <>
              {' · '}
              <Text color='deemphasized' tagName='span' variant='deemphasized'>
                {command.entity}
              </Text>
            </>
          ) : null}
        </Text>
        {command.description ? (
          <Text color='deemphasized' variant='command.description'>
            {command.description}
          </Text>
        ) : null}
      </Stack>
      <Box visibility={isActive ? undefined : 'hidden'}>
        <Box color='deemphasized' fontSize='button.small' fontWeight='deemphasized' tagName='span'>
          ⏎
        </Box>
      </Box>
    </Box>
  );
}
