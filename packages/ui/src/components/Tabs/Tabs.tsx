import type { ReactNode } from 'react';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Text } from '../Text/Text.js';

import * as styles from './Tabs.css.js';

const rootClass = designSystem({ display: 'flex', minWidth: 'none' });

const listClass = [
  designSystem({
    display: 'flex',
    minWidth: 'none',
    overflowX: 'auto',
    position: 'relative'
  }),
  styles.list
].join(' ');

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
  /** Directly after the last tab, e.g. a button that adds one. It stays in view while the tabs scroll. */
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
 * keys move between them. Tabs sit flush (0022) and scroll sideways when they don't fit.
 * Controlled: the page owns the value.
 */
export function Tabs({ after, items, label, onValueChange, value }: TabsProps) {
  return (
    <Box
      alignItems='center'
      borderBottomColor='line'
      borderBottomStyle='solid'
      borderBottomWidth='hairline'
      display='flex'
      minWidth='none'
    >
      <BaseTabs.Root className={rootClass} onValueChange={next => onValueChange(String(next))} value={value}>
        <BaseTabs.List aria-label={label} className={listClass}>
          {items.map(item => (
            <BaseTabs.Tab className={state => tabClass(state.active)} key={item.value} value={item.value}>
              <Text variant='body'>{item.label}</Text>
            </BaseTabs.Tab>
          ))}
          <BaseTabs.Indicator className={styles.indicator} />
        </BaseTabs.List>
      </BaseTabs.Root>
      {after}
    </Box>
  );
}
