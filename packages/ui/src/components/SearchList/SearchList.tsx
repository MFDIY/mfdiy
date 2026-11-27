import { Autocomplete } from '@base-ui/react/autocomplete';
import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';
import { TextInput } from '../TextInput/TextInput.js';

export type SearchListItem = {
  /** A second, dimmed line: what the item does, or what it belongs to. */
  description?: string | undefined;
  id: string;
  label: string;
  /** Choosing it opens more choices rather than finishing. */
  opens?: boolean | undefined;
  /** A small picture before the label. */
  preview?: ReactNode | undefined;
};

export type SearchListGroup = {
  items: readonly SearchListItem[];
  /** Shown above the group's items; leave out for a single, unnamed group. */
  label?: string | undefined;
};

export type SearchListProps = {
  /** A way back, e.g. after choosing an item that opened more. */
  back?: { label: string; onBack: () => void } | undefined;
  /** Shows that rows can be dragged out of the list (the `grab` cursor). */
  draggable?: boolean | undefined;
  /** Shown when there's nothing to list. */
  emptyText: string;
  /** Focuses the search field when the list appears. */
  focusSearch?: boolean | undefined;
  /** What to list: already searched, as the list never filters on its own. */
  groups: readonly SearchListGroup[];
  /** Names the search field and the list for assistive technology. */
  label: string;
  /** The item under the pointer or picked with the arrow keys, or null. */
  onHighlight?: ((id: string | null) => void) | undefined;
  /** Lets a row be dragged out of the list, e.g. onto the canvas. */
  onItemPointerDown?: ((id: string, event: PointerEvent<HTMLElement>) => void) | undefined;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  /** Says what can be searched for. */
  placeholder: string;
  query: string;
};

type Group = { value: string; items: SearchListItem[] };

/*
 * Base UI's parts are styled with the design system's classes (`designSystem`), so they reuse
 * Sprinkles' CSS instead of generating their own.
 */

/** Scrolls on its own, below the search field. */
const listClass = designSystem({ backgroundColor: 'inherit' });

const itemClass = (highlighted: boolean, draggable: boolean) =>
  designSystem({
    alignItems: 'center',
    backgroundColor: highlighted ? 'hover' : 'transparent',
    cursor: draggable ? 'grab' : 'default',
    display: 'flex',
    gap: '3x',
    minHeight: 'control',
    outlineStyle: 'none',
    paddingBlock: '2x',
    paddingInline: '3x',
    userSelect: 'none'
  });

/** Only what the person typed changes the search; choosing an item doesn't fill it in. */
const QUERY_REASONS = new Set(['input-change', 'input-clear', 'clear-press', 'escape-key']);

/**
 * A search field over a list it controls with the arrow keys and Enter: an always-open list, not a
 * popup. Built on Base UI's Autocomplete (0003). It never filters by itself; the owner searches and
 * passes in what to show, so one search can cover several kinds of things.
 */
export function SearchList({
  back,
  draggable = false,
  emptyText,
  focusSearch = false,
  groups,
  label,
  onHighlight,
  onItemPointerDown,
  onQueryChange,
  onSelect,
  placeholder,
  query
}: SearchListProps) {
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Moving focus is a DOM matter; `autoFocus` would also steal it from screen readers' context.
  useEffect(() => {
    if (focusSearch) {
      inputRef.current?.focus();
    }
  }, [focusSearch]);
  const items: Group[] = groups.map((group, index) => ({ value: group.label ?? `${index}`, items: [...group.items] }));

  return (
    <Box backgroundColor='inherit'>
      <Autocomplete.Root
        autoHighlight
        filter={null}
        inline
        items={items}
        itemToStringValue={(item: SearchListItem) => item.label}
        mode='none'
        onItemHighlighted={item => onHighlight?.((item as SearchListItem | undefined)?.id ?? null)}
        onValueChange={(value, details) => {
          if (QUERY_REASONS.has(details.reason)) {
            onQueryChange(value);
          }
        }}
        open
        value={query}
      >
        <Box backgroundColor='inherit' paddingBottom='3x' position='sticky' top='none' zIndex='1'>
          <Stack spacing='3x'>
            {back ? (
              <Box alignItems='center' display='flex' gap='2x'>
                <IconButton icon='chevron_left' label='Back' onClick={back.onBack} />
                <Text color='text.dim' id={headingId} variant='label'>
                  {back.label}
                </Text>
              </Box>
            ) : null}
            <Autocomplete.Input
              aria-describedby={back ? headingId : undefined}
              aria-label={label}
              placeholder={placeholder}
              ref={inputRef}
              render={<TextInput clearLabel='Clear search' onClear={() => onQueryChange('')} />}
            />
          </Stack>
        </Box>
        <Autocomplete.Empty>
          <Box paddingBlock='4x' paddingInline='3x'>
            <Text color='text.dim' variant='body'>
              {emptyText}
            </Text>
          </Box>
        </Autocomplete.Empty>
        <Autocomplete.List aria-label={label} className={listClass}>
          {(group: Group) => (
            <Autocomplete.Group items={group.items} key={group.value}>
              {groups.length > 1 || groups[0]?.label ? (
                <Box paddingBottom='2x' paddingInline='3x' paddingTop='4x'>
                  {/* Rendered as the Text itself: Base UI replaces a rendered element's children. */}
                  <Autocomplete.GroupLabel render={<Text color='text.dim' variant='label' />}>
                    {group.value}
                  </Autocomplete.GroupLabel>
                </Box>
              ) : null}
              <Autocomplete.Collection>
                {(item: SearchListItem) => (
                  <Autocomplete.Item
                    className={state => itemClass(state.highlighted, draggable)}
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    onPointerDown={event => onItemPointerDown?.(item.id, event)}
                    value={item}
                  >
                    {item.preview ? (
                      <Box
                        aria-hidden
                        flexShrink='0'
                        height='7x'
                        inert
                        overflow='hidden'
                        pointerEvents='none'
                        width='8x'
                      >
                        {item.preview}
                      </Box>
                    ) : null}
                    <Box flexGrow='1' minWidth='none'>
                      <Stack spacing='2x'>
                        <Text variant='body'>{item.label}</Text>
                        {item.description ? (
                          <Text color='text.dim' variant='body'>
                            {item.description}
                          </Text>
                        ) : null}
                      </Stack>
                    </Box>
                    {item.opens ? (
                      <Box color='text.dim' flexShrink='0'>
                        <Icon name='chevron_right' />
                      </Box>
                    ) : null}
                  </Autocomplete.Item>
                )}
              </Autocomplete.Collection>
            </Autocomplete.Group>
          )}
        </Autocomplete.List>
      </Autocomplete.Root>
    </Box>
  );
}
