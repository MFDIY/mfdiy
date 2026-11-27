import type { ReactNode } from 'react';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useEffect, useRef, useState } from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { Menu, MenuItem } from '../Menu/Menu.js';
import { Text } from '../Text/Text.js';
import { Tooltip, TooltipGroup } from '../Tooltip/Tooltip.js';

import * as styles from './Tabs.css.js';
import { hiddenTabs } from './hiddenTabs.js';

const rootClass = designSystem({ display: 'flex', minWidth: 'none' });

const listClass = designSystem({ display: 'flex', minWidth: 'none', position: 'relative' });

const tabClass = (active: boolean) =>
  designSystem({
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: { default: 'transparent', hover: 'hover', active: 'pressed' },
    borderStyle: 'hidden',
    color: active ? 'text' : { default: 'text.dim', hover: 'text', active: 'text' },
    cursor: 'default',
    display: 'flex',
    flexShrink: '0',
    fontFamily: 'inherit',
    gap: '2x',
    height: 'control',
    maxWidth: 'tab',
    outlineColor: 'focus',
    outlineOffset: 'focus',
    outlineStyle: { default: 'none', focusVisible: 'solid' },
    outlineWidth: 'focus',
    paddingInline: '3x',
    userSelect: 'none'
  });

export type TabsItem = {
  label: string;
  /**
   * Marks the tab with a warning and says why, e.g. "Overlap": in its tooltip and to assistive
   * technology.
   */
  mark?: string | undefined;
  value: string;
};

export type TabsProps = {
  /** Directly after the last tab, e.g. a button that adds one. */
  after?: ReactNode | undefined;
  items: readonly TabsItem[];
  /** Names the tabs for assistive technology, e.g. "Pages". */
  label: string;
  onValueChange: (value: string) => void;
  /** Draws a hairline under the whole row. Leave it off where what the tabs sit in has its own. */
  underline?: boolean | undefined;
  /** The active tab. */
  value: string;
};

/**
 * A row of tabs, the active one underlined, over a hairline with `underline`, built on Base UI's Tabs (0003): arrow
 * keys move between them. Tabs sit flush (0022) and never scroll: those that don't fit go into a
 * menu that says how many there are, and the active tab is always one of those shown. A long name
 * is cut short with an ellipsis, and a tooltip shows it in full. Takes the width of its container.
 * Controlled: the page owns the value.
 */
export function Tabs({ after, items, label, onValueChange, underline = false, value }: TabsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);
  const moreRef = useRef<HTMLSpanElement>(null);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;

    if (!row || !measure) {
      return;
    }

    function fit() {
      const widths = items.map((_, index) => tabRefs.current[index]?.offsetWidth ?? 0);
      const room = (row?.clientWidth ?? 0) - (afterRef.current?.offsetWidth ?? 0);
      const active = items.findIndex(item => item.value === value);
      const indices = hiddenTabs(widths, active, room, moreRef.current?.offsetWidth ?? 0);

      setHidden(new Set(items.filter((_, index) => indices.has(index)).map(item => item.value)));
    }

    const observer = new ResizeObserver(fit);

    observer.observe(row);
    observer.observe(measure);

    return () => observer.disconnect();
  }, [items, value]);

  const shown = items.filter(item => !hidden.has(item.value));
  const overflow = items.filter(item => hidden.has(item.value));

  return (
    <Box
      alignItems='center'
      borderBottomColor={underline ? 'line' : undefined}
      borderBottomStyle={underline ? 'solid' : undefined}
      borderBottomWidth={underline ? 'hairline' : undefined}
      display='flex'
      minWidth='none'
      position='relative'
      ref={rowRef}
      width='full'
    >
      <Box aria-hidden inert overflow='hidden' position='absolute' visibility='hidden' width='none'>
        <Box display='flex' ref={measureRef} width='max-content'>
          {items.map((item, index) => (
            <Box
              className={tabClass(false)}
              key={item.value}
              ref={(element: HTMLSpanElement | null) => {
                tabRefs.current[index] = element;
              }}
              tagName='span'
            >
              <TabLabel item={item} />
            </Box>
          ))}
          <Box ref={moreRef} tagName='span'>
            <MoreButton count={items.length} open={false} />
          </Box>
        </Box>
      </Box>
      <BaseTabs.Root className={rootClass} onValueChange={next => onValueChange(String(next))} value={value}>
        <BaseTabs.List aria-label={label} className={listClass}>
          <TooltipGroup>
            {shown.map(item => (
              <Tooltip key={item.value} label={item.mark ? `${item.label} · ${item.mark}` : item.label}>
                <BaseTabs.Tab
                  aria-label={item.mark ? `${item.label}, ${item.mark}` : undefined}
                  className={tabClass(item.value === value)}
                  value={item.value}
                >
                  <TabLabel item={item} />
                </BaseTabs.Tab>
              </Tooltip>
            ))}
          </TooltipGroup>
          <BaseTabs.Indicator className={styles.indicator} />
        </BaseTabs.List>
      </BaseTabs.Root>
      {overflow.length > 0 ? (
        <Menu trigger={open => <MoreButton count={overflow.length} open={open} />}>
          {overflow.map(item => (
            <MenuItem
              icon={item.mark ? 'warning' : undefined}
              key={item.value}
              onClick={() => onValueChange(item.value)}
            >
              {item.mark ? `${item.label} · ${item.mark}` : item.label}
            </MenuItem>
          ))}
        </Menu>
      ) : null}
      {after ? (
        <Box display='flex' flexShrink='0' ref={afterRef}>
          {after}
        </Box>
      ) : null}
    </Box>
  );
}

function TabLabel({ item }: { item: TabsItem }) {
  return (
    <>
      <Text truncate variant='body'>
        {item.label}
      </Text>
      {item.mark ? (
        <Box color='status.critical' flexShrink='0'>
          <Icon name='warning' size='small' />
        </Box>
      ) : null}
    </>
  );
}

/** Says how many tabs didn't fit, and opens a menu of them. */
function MoreButton({ count, open, ...restProps }: { count: number; open: boolean }) {
  return (
    <Button
      {...restProps}
      aria-label={`${count} more`}
      icon='keyboard_arrow_down'
      iconPosition='trailing'
      variant={open ? 'default' : 'quiet'}
    >
      {`+${count}`}
    </Button>
  );
}
