import type { ReactNode } from 'react';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Icon } from '../Icon/Icon.js';
import { Sticky } from '../Sticky/Sticky.js';
import { Text } from '../Text/Text.js';

import * as styles from './Accordion.css.js';

const triggerClass = [
  designSystem({
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: { default: 'transparent', hover: 'hover', active: 'pressed' },
    borderStyle: 'hidden',
    color: 'text',
    cursor: 'default',
    display: 'flex',
    gap: '2x',
    height: 'control',
    outlineColor: 'focus',
    outlineOffset: 'focus',
    outlineStyle: { default: 'none', focusVisible: 'solid' },
    outlineWidth: 'focus',
    paddingBlock: 'none',
    paddingInline: '3x',
    textAlign: 'left',
    width: 'full'
  }),
  styles.trigger
].join(' ');

export type AccordionItem = {
  content: ReactNode;
  /** Something inside needs fixing: the summary says so in the critical colour. */
  invalid?: boolean | undefined;
  /** Names the item, e.g. a widget's input. */
  label: string;
  /** What's inside, at a glance, shown dimmed after the label while it's closed or open. */
  summary?: string | undefined;
  /** Identifies the item, e.g. for `defaultOpen`. */
  value: string;
};

export type AccordionProps = {
  /** The item open at first, if any. Only one is open at a time. */
  defaultOpen?: readonly string[] | undefined;
  items: readonly AccordionItem[];
};

/**
 * A list of items that open to show their content, built on Base UI's Accordion (0003, 0023).
 * Each item's row names it and summarises what's inside, so a closed list can still be read. Only
 * one item is open at a time, and its row sticks while its content scrolls under it (0023). Like a
 * list's rows, items fill their container and pad their own content; let them reach a frame's
 * edges with `Bleed`.
 */
export function Accordion({ defaultOpen = [], items }: AccordionProps) {
  return (
    <BaseAccordion.Root defaultValue={[...defaultOpen].slice(0, 1)} multiple={false}>
      {items.map(({ content, invalid = false, label, summary, value }) => (
        <BaseAccordion.Item className={styles.item} key={value} value={value}>
          <Sticky>
            <BaseAccordion.Header render={<Box margin='none' tagName='h4' />}>
              <BaseAccordion.Trigger className={triggerClass}>
                <Box flexShrink='0'>
                  <Text color='text' variant='label'>
                    {label}
                  </Text>
                </Box>
                <Box flexGrow='1' minWidth='none'>
                  {summary ? (
                    <Text color={invalid ? 'status.critical' : 'text.dim'} truncate variant='body'>
                      {summary}
                    </Text>
                  ) : null}
                </Box>
                <Box className={styles.chevron} color='text.dim' display='flex'>
                  <Icon name='keyboard_arrow_down' />
                </Box>
              </BaseAccordion.Trigger>
            </BaseAccordion.Header>
          </Sticky>
          <BaseAccordion.Panel>
            <Box paddingBottom='3x' paddingInline='3x' paddingTop='2x'>
              {content}
            </Box>
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
}
