import type { Layout, Page } from '@mfdiy/schema';

import { MAX_GRID_SIZE } from '@mfdiy/schema';
import { Box, Columns, NumberField, ScrollContainer, Stack, Text, TextField } from '@mfdiy/ui/components';
import { useState } from 'react';

import { resizeGrid } from './editing.js';
import { Section, Typing, useTyping } from './fields.js';

export type PagePropertiesProps = {
  layout: Layout;
  onChange: (page: Page, merge?: string) => void;
  page: Page;
};

const MAX_PAGE_NAME_LENGTH = 32;

/** What the panel shows while no widget is selected (0023): the page's name and grid. */
export function PageProperties({ layout, onChange, page }: PagePropertiesProps) {
  const typing = useTyping(page.id, page);
  /** An empty name while it's typed; a page always keeps one, so it isn't saved. */
  const [emptyName, setEmptyName] = useState(false);

  function gridField(axis: 'columns' | 'rows', label: string) {
    return (
      <Typing onBlur={typing.onBlur} share>
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
    <Box display='flex' flexDirection='column' height='full' minHeight='none'>
      <Box flexShrink='0' paddingBottom='4x'>
        <Text tagName='h2' truncate variant='heading'>
          Page
        </Text>
      </Box>
      <ScrollContainer>
        <Box>
          <Stack dividers spacing='5x'>
            <Box
              onBlur={event => {
                setEmptyName(false);
                typing.onBlur(event);
              }}
            >
              <TextField
                error={emptyName ? 'A page needs a name.' : undefined}
                label='Name'
                maxLength={MAX_PAGE_NAME_LENGTH}
                onChange={name => {
                  setEmptyName(name.trim() === '');

                  if (name.trim() !== '') {
                    onChange({ ...page, name }, typing.merge('name'));
                  }
                }}
                value={emptyName ? '' : page.name}
              />
            </Box>
            <Section title='Grid'>
              <Text color='text.dim' variant='body'>
                Widgets keep their share of the page when the grid changes.
              </Text>
              <Columns spacing='3x'>
                {gridField('columns', 'Columns')}
                {gridField('rows', 'Rows')}
              </Columns>
            </Section>
          </Stack>
        </Box>
      </ScrollContainer>
    </Box>
  );
}
