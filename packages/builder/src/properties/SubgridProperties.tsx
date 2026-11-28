import type { SharedSubgrid } from '@mfdiy/schema';

import { MAX_GRID_SIZE, pageToSubgrid, subgridAsPage } from '@mfdiy/schema';
import { Box, Button, Columns, Group, IconButton, NumberField, Stack, Text, usePanelForm } from '@mfdiy/ui/components';

import { resizeGrid } from './editing.js';
import { Typing, useTyping } from './fields.js';

export type SubgridPropertiesProps = {
  entered: boolean;
  onChange: (subgrid: SharedSubgrid, merge?: string) => void;
  /** Adds a copy of it beside it, as a widget's Duplicate does (0023). */
  onDuplicate?: (() => void) | undefined;
  onEnter?: (() => void) | undefined;
  onExit?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
  subgrid: SharedSubgrid;
};

/**
 * A shared subgrid's properties (0026): Duplicate and Remove in the header, as a widget's (0023), its
 * columns × rows, and Edit subgrid to enter it, or Exit subgrid while it's entered and nothing in it
 * is selected.
 */
export function SubgridProperties({
  entered,
  onChange,
  onDuplicate,
  onEnter,
  onExit,
  onRemove,
  subgrid
}: SubgridPropertiesProps) {
  const typing = useTyping(subgrid.id, subgrid);
  const sidebar = usePanelForm() === 'sidebars';

  function gridField(axis: 'columns' | 'rows', label: string) {
    return (
      <Typing onBlur={typing.onBlur}>
        <NumberField
          label={label}
          max={MAX_GRID_SIZE}
          min={1}
          onChange={value => {
            const base = typing.base();
            const page = subgridAsPage(base);
            const [layout] = page.layouts;

            if (value !== null && layout) {
              onChange(
                pageToSubgrid(base, resizeGrid(page, layout, { ...layout.grid, [axis]: value })),
                typing.merge(axis)
              );
            }
          }}
          value={subgrid.grid[axis]}
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
                Shared subgrid
              </Text>
            </Box>
            {onDuplicate ? <IconButton icon='content_copy' label='Duplicate' onClick={onDuplicate} /> : null}
            {onRemove ? <IconButton icon='delete' label='Remove' onClick={onRemove} /> : null}
          </Box>
        ) : onDuplicate || onRemove ? (
          <Columns spacing='3x'>
            {onDuplicate ? (
              <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
                <Button icon='content_copy' onClick={onDuplicate} width='full'>
                  Duplicate
                </Button>
              </Box>
            ) : null}
            {onRemove ? (
              <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
                <Button icon='delete' onClick={onRemove} width='full'>
                  Remove
                </Button>
              </Box>
            ) : null}
          </Columns>
        ) : null}
      </Box>
      <Stack spacing='5x'>
        <Text color='text.dim' variant='body'>
          Shows on every page, in the same place.
        </Text>
        {entered ? (
          <Button onClick={onExit} width='full'>
            Exit subgrid
          </Button>
        ) : (
          <Button onClick={onEnter} variant='primary' width='full'>
            Edit subgrid
          </Button>
        )}
        <Group description='Its widgets keep their share of it when the grid changes.' title='Grid'>
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
