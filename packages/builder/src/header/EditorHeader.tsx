import type { ReactNode } from 'react';

import { Box, Button, IconButton, Logomark, Menu, Tabs, Text, type TabsItem } from '@mfdiy/ui/components';

export type EditorHeaderProps = {
  /** The accent of the page shown, which the logomark takes. */
  accent?: string | undefined;
  canRedo: boolean;
  canUndo: boolean;
  /** There are changes to save: Save turns to the accent and can be pressed. */
  dirty: boolean;
  /** Every profile action but Save, as `MenuItem`s (0008). */
  menu: ReactNode;
  /** The profile's name. */
  name: string;
  onAddPage: () => void;
  onBack: () => void;
  onPageChange: (id: string) => void;
  onRedo: () => void;
  onSave: () => void;
  onUndo: () => void;
  /** The page shown. */
  pageId: string;
  pages: readonly TabsItem[];
  saving: boolean;
};

/**
 * The builder's header, in one row (0008): the logomark, Back, the profile's name, the page tabs
 * with "+", undo and redo, Save, and a `⋯` menu with every other profile action. Save shows whether
 * there's anything to save, so no status beside it shifts the row. Where it's narrower, the
 * logomark and then the name give way to the tabs. It draws no hairline: what it's placed in does.
 */
export function EditorHeader({
  accent,
  canRedo,
  canUndo,
  dirty,
  menu,
  name,
  onAddPage,
  onBack,
  onPageChange,
  onRedo,
  onSave,
  onUndo,
  pageId,
  pages,
  saving
}: EditorHeaderProps) {
  return (
    <Box containerType='inline-size' tagName='header'>
      <Box alignItems='center' display='flex' gap='2x'>
        <Box alignItems='center' display={{ default: 'none', 900: 'flex' }} flexShrink='0' gap='4x' paddingRight='2x'>
          <Logomark color={accent} />
          <Box borderLeftColor='line' borderLeftStyle='solid' borderLeftWidth='hairline' height='5x' />
        </Box>
        <IconButton icon='chevron_left' label='All profiles' onClick={onBack} />
        <Box display={{ default: 'none', 600: 'block' }} flexShrink='0' maxWidth='panel' minWidth='none'>
          <Text tagName='h1' truncate variant='heading'>
            {name}
          </Text>
        </Box>
        <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
          <Tabs
            after={<IconButton icon='add' label='Add a page' onClick={onAddPage} />}
            items={pages}
            label='Pages'
            onValueChange={onPageChange}
            value={pageId}
          />
        </Box>
        <Box display='flex' flexShrink='0'>
          <IconButton disabled={!canUndo} icon='undo' label='Undo' onClick={onUndo} />
          <IconButton disabled={!canRedo} icon='redo' label='Redo' onClick={onRedo} />
        </Box>
        <Box flexShrink='0'>
          <Button disabled={!dirty || saving} onClick={onSave} variant={dirty ? 'primary' : 'default'}>
            Save
          </Button>
        </Box>
        <Menu trigger={<IconButton icon='more_horiz' label='More' />}>{menu}</Menu>
      </Box>
    </Box>
  );
}
