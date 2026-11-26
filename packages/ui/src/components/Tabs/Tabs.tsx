import type { ReactNode } from 'react';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useEffect, useRef, useState } from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Button } from '../Button/Button.js';
import { Menu, MenuItem } from '../Menu/Menu.js';
import { Text } from '../Text/Text.js';

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
    color: active ? 'text' : { default: 'text.dim', hover: 'text' },
    cursor: 'default',
    display: 'flex',
    flexShrink: '0',
    fontFamily: 'inherit',
    height: 'control',
    outlineColor: 'focus',
    outlineOffset: 'focus',
    outlineStyle: { default: 'none', focusVisible: 'solid' },
    outlineWidth: 'focus',
    paddingInline: '3x',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  });

export type TabsItem = {
  label: string;
  value: string;
};

export type TabsProps = {
  /** Directly after the last tab, e.g. a button that adds one. */
  after?: ReactNode | undefined;
  items: readonly TabsItem[];
  /** Names the tabs for assistive technology, e.g. "Pages". */
  label: string;
  onValueChange: (value: string) => void;
  /** The active tab. */
  value: string;
};

/**
 * A row of tabs over a hairline, the active one underlined, built on Base UI's Tabs (0003): arrow
 * keys move between them. Tabs sit flush (0022) and never scroll: those that don't fit go into a
 * menu that says how many there are, and the active tab is always one of those shown. Takes the
 * width of its container. Controlled: the page owns the value.
 */
export function Tabs({ after, items, label, onValueChange, value }: TabsProps) {
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
      borderBottomColor='line'
      borderBottomStyle='solid'
      borderBottomWidth='hairline'
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
              <Text variant='body'>{item.label}</Text>
            </Box>
          ))}
          <Box ref={moreRef} tagName='span'>
            <MoreButton count={items.length} open={false} />
          </Box>
        </Box>
      </Box>
      <BaseTabs.Root className={rootClass} onValueChange={next => onValueChange(String(next))} value={value}>
        <BaseTabs.List aria-label={label} className={listClass}>
          {shown.map(item => (
            <BaseTabs.Tab className={state => tabClass(state.active)} key={item.value} value={item.value}>
              <Text variant='body'>{item.label}</Text>
            </BaseTabs.Tab>
          ))}
          <BaseTabs.Indicator className={styles.indicator} />
        </BaseTabs.List>
      </BaseTabs.Root>
      {overflow.length > 0 ? (
        <Menu trigger={open => <MoreButton count={overflow.length} open={open} />}>
          {overflow.map(item => (
            <MenuItem key={item.value} onClick={() => onValueChange(item.value)}>
              {item.label}
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
