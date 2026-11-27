import type { ReactNode } from 'react';

import {
  Box,
  Button,
  IconButton,
  Logomark,
  Menu,
  MenuItem,
  MenuSeparator,
  Tabs,
  type TabsItem
} from '@mfdiy/ui/components';

export type EditorHeaderProps = {
  /** The accent of the page shown, which the logomark takes. */
  accent?: string | undefined;
  canRedo: boolean;
  canUndo: boolean;
  /** There are changes to save: Save turns to the accent and can be pressed. */
  dirty: boolean;
  /** Every profile action but Save, as `MenuItem`s (0008). */
  menu: ReactNode;
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
 * The builder's header, in one row exactly a control high (0008): the logomark, Back between two
 * dividers, the page tabs with "+", then undo, redo, Save and a `⋯` menu with every other profile
 * action, side by side. Save shows whether there's anything to save. On narrower screens the
 * logomark gives way, and on a phone undo, redo and Save move into `⋯`, so the tabs have the row.
 * Spans the page, and answers to its width: the row and the menu, which opens outside the header,
 * change together. It draws no hairline: what it's placed in does.
 */
export function EditorHeader({
  accent,
  canRedo,
  canUndo,
  dirty,
  menu,
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
    <Box alignItems='center' display='flex' tagName='header'>
      <Box alignItems='center' display={{ default: 'none', 900: 'flex' }} flexShrink='0'>
        <Box paddingRight='4x'>
          <Logomark color={accent} />
        </Box>
        <Divider />
      </Box>
      <IconButton icon='chevron_left' label='All profiles' onClick={onBack} />
      <Divider />
      <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
        <Tabs
          after={<IconButton icon='add' label='Add a page' onClick={onAddPage} />}
          items={pages}
          label='Pages'
          onValueChange={onPageChange}
          value={pageId}
        />
      </Box>
      <Box display={{ default: 'none', 600: 'flex' }} flexShrink='0'>
        <IconButton disabled={!canUndo} icon='undo' label='Undo' onClick={onUndo} />
        <IconButton disabled={!canRedo} icon='redo' label='Redo' onClick={onRedo} />
        <Button disabled={!dirty || saving} onClick={onSave} variant={dirty ? 'primary' : 'quiet'}>
          Save
        </Button>
      </Box>
      <Menu trigger={<IconButton icon='more_horiz' label='More' />}>
        <PhoneOnly>
          <MenuItem disabled={!dirty || saving} onClick={onSave}>
            Save
          </MenuItem>
        </PhoneOnly>
        {menu}
        <PhoneOnly>
          <MenuSeparator />
          <MenuItem disabled={!canUndo} icon='undo' onClick={onUndo}>
            Undo
          </MenuItem>
          <MenuItem disabled={!canRedo} icon='redo' onClick={onRedo}>
            Redo
          </MenuItem>
        </PhoneOnly>
      </Menu>
    </Box>
  );
}

/** A hairline as tall as the row, hugging what's beside it. */
function Divider() {
  return (
    <Box borderLeftColor='line' borderLeftStyle='solid' borderLeftWidth='hairline' flexShrink='0' height='control' />
  );
}

/** Menu items for where the row has no room for them. Hidden items are skipped by the arrow keys. */
function PhoneOnly({ children }: { children: ReactNode }) {
  return <Box display={{ default: 'block', 600: 'none' }}>{children}</Box>;
}
