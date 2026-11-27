import type { ReactNode } from 'react';

import { Box, Button, IconButton, Menu, Tabs, Text, type TabsItem } from '@mfdiy/ui/components';
import { useId } from 'react';

export type EditorHeaderProps = {
  canRedo: boolean;
  canUndo: boolean;
  /** There are changes to save: Save can be pressed, and shows a dot on a narrow header. */
  dirty: boolean;
  /** Saving failed, or another device changed the profile: the status and the dot turn critical. */
  failed: boolean;
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
  /** What's saved, e.g. "Unsaved changes": beside Save, or naming its dot on a narrow header. */
  status: string;
};

/**
 * The builder's header, in one row (0008): Back, the profile's name, the page tabs with "+", undo
 * and redo, the save status, Save, and a `⋯` menu with every other profile action. Where it's
 * narrow, the name gives way to the tabs, and a dot on Save replaces the status.
 */
export function EditorHeader({
  canRedo,
  canUndo,
  dirty,
  failed,
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
  saving,
  status
}: EditorHeaderProps) {
  const statusId = useId();

  return (
    <Box containerType='inline-size' tagName='header'>
      <Box alignItems='center' display='flex' gap='2x'>
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
        <Box display={{ default: 'none', 700: 'block' }} flexShrink='0'>
          <Text color={failed ? 'status.critical' : 'text.dim'} id={statusId} role='status' variant='body'>
            {status}
          </Text>
        </Box>
        <Box flexShrink='0' position='relative'>
          <Button aria-describedby={statusId} disabled={!dirty || saving} onClick={onSave} variant='primary'>
            Save
          </Button>
          {dirty || failed ? (
            <Box
              display={{ default: 'block', 700: 'none' }}
              pointerEvents='none'
              position='absolute'
              right='1x'
              top='1x'
            >
              <Box
                backgroundColor={failed ? 'status.critical' : 'surface'}
                borderRadius='full'
                height='2x'
                width='2x'
              />
            </Box>
          ) : null}
        </Box>
        <Menu trigger={<IconButton icon='more_horiz' label='More' />}>{menu}</Menu>
      </Box>
    </Box>
  );
}
