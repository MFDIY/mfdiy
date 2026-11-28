import type { Layout, Page } from '@mfdiy/schema';

import { MAX_GRID_SIZE, MAX_PAGE_NAME_LENGTH } from '@mfdiy/schema';
import {
  Box,
  Button,
  Columns,
  Group,
  Icon,
  IconButton,
  NumberField,
  Stack,
  Text,
  TextField,
  usePanelForm
} from '@mfdiy/ui/components';
import { useState } from 'react';

import { resizeGrid } from './editing.js';
import { Typing, useTyping } from './fields.js';

export type PagePropertiesProps = {
  /** Focuses the name field when shown, e.g. on a page just duplicated (0023). */
  focusName?: boolean | undefined;
  layout: Layout;
  onChange: (page: Page, merge?: string) => void;
  /** Deletes the page; greyed out without it, as on a profile's last page. */
  onDelete?: (() => void) | undefined;
  /** Duplicates the page; greyed out without it. */
  onDuplicate?: (() => void) | undefined;
  page: Page;
  /** No page button leads to the page (0026). */
  unreachable?: boolean | undefined;
};

/**
 * What the panel shows while no widget is selected (0023): the page's name and grid, with Duplicate
 * and Delete in its header, as a widget's are.
 */
export function PageProperties({
  focusName = false,
  layout,
  onChange,
  onDelete,
  onDuplicate,
  page,
  unreachable = false
}: PagePropertiesProps) {
  const typing = useTyping(page.id, page);
  const sidebar = usePanelForm() === 'sidebars';
  /** The name as typed; an empty one isn't saved, as a page always has a name, and goes on leaving. */
  const [draft, setDraft] = useState<string | null>(null);

  function gridField(axis: 'columns' | 'rows', label: string) {
    return (
      <Typing onBlur={typing.onBlur}>
        <NumberField
          label={label}
          max={MAX_GRID_SIZE}
          min={1}
          onChange={value => {
            const base = typing.base();
            const baseLayout = base.layouts.find(candidate => candidate.orientation === layout.orientation);

            if (value !== null && baseLayout) {
              onChange(resizeGrid(base, baseLayout, { ...baseLayout.grid, [axis]: value }), typing.merge(axis));
            }
          }}
          value={layout.grid[axis]}
        />
      </Typing>
    );
  }

  return (
    <Box>
      <Box flexShrink='0' paddingBottom='4x'>
        {sidebar ? (
          <Box alignItems='center' display='flex' gap='2x' height='control'>
            <Box flexGrow='1' minWidth='none'>
              <Text tagName='h2' truncate variant='heading'>
                Page
              </Text>
            </Box>
            <IconButton disabled={!onDuplicate} icon='content_copy' label='Duplicate' onClick={onDuplicate} />
            <IconButton disabled={!onDelete} icon='delete' label='Delete' onClick={onDelete} />
          </Box>
        ) : (
          <Columns spacing='3x'>
            <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
              <Button disabled={!onDuplicate} icon='content_copy' onClick={onDuplicate} width='full'>
                Duplicate
              </Button>
            </Box>
            <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
              <Button disabled={!onDelete} icon='delete' onClick={onDelete} width='full'>
                Delete
              </Button>
            </Box>
          </Columns>
        )}
      </Box>
      <Stack spacing='5x'>
        {unreachable ? (
          <Box alignItems='flex-start' color='status.warning' display='flex' gap='2x' role='note'>
            <Icon name='warning' size='small' />
            <Text color='status.warning' variant='body'>
              No page button shows this page, so it can only be seen here. Add a page button for it, such as in a shared
              subgrid.
            </Text>
          </Box>
        ) : null}
        <Box
          onBlur={event => {
            setDraft(null);
            typing.onBlur(event);
          }}
        >
          <TextField
            focus={focusName}
            label='Name'
            maxLength={MAX_PAGE_NAME_LENGTH}
            onChange={name => {
              setDraft(name);

              if (name.trim() !== '') {
                onChange({ ...page, name }, typing.merge('name'));
              }
            }}
            placeholder={page.name}
            value={draft ?? page.name}
          />
        </Box>
        <Group description='Widgets keep their share of the page when the grid changes.' title='Grid'>
          <Columns spacing='3x'>
            <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
              {gridField('columns', 'Columns')}
            </Box>
            <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
              {gridField('rows', 'Rows')}
            </Box>
          </Columns>
        </Group>
      </Stack>
    </Box>
  );
}
