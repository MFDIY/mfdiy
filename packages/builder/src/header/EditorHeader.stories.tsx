import type { Meta, StoryObj } from '@storybook/react-vite';

import { amberCrt, pageToken } from '@mfdiy/instruments';
import { Box, MenuItem, type TabsItem } from '@mfdiy/ui/components';
import { useState, type ComponentProps } from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { EditorHeader } from './EditorHeader.js';

/** The header answers to the page's width, so narrower stories set the viewport (Storybook's own sizes). */
const phone = { viewport: { value: 'mobile2', isRotated: false } };
const tablet = { viewport: { value: 'tablet', isRotated: false } };

/** Accents of the built-in themes, as the logomark would take them from the page shown. */
const accents = {
  Phosphor: pageToken('accent', undefined, undefined),
  'Amber CRT': pageToken('accent', amberCrt.tokens, undefined)
};

const twoPages: readonly TabsItem[] = [
  { label: 'Flight', value: 'flight' },
  { label: 'Combat', value: 'combat' }
];

type DemoProps = ComponentProps<typeof EditorHeader>;

/**
 * Placed as the builder places it: a hairline under the whole header, so the active tab's line
 * sits on it. Holds the pages and the page shown, so tabs can be
 * switched and added in Storybook.
 */
function Demo({ onAddPage, onPageChange, pageId: initialPageId, pages: initialPages, ...restProps }: DemoProps) {
  const [pages, setPages] = useState(initialPages);
  const [pageId, setPageId] = useState(initialPageId);

  return (
    <Box backgroundColor='surface' borderBottomColor='line' borderBottomStyle='solid' borderBottomWidth='hairline'>
      <EditorHeader
        {...restProps}
        onAddPage={() => {
          const value = `page-${pages.length + 1}`;

          setPages([...pages, { label: `Page ${pages.length + 1}`, value }]);
          setPageId(value);
          onAddPage();
        }}
        onPageChange={next => {
          setPageId(next);
          onPageChange(next);
        }}
        pageId={pageId}
        pages={pages}
      />
    </Box>
  );
}

const meta = {
  title: 'Builder/EditorHeader',
  component: EditorHeader,
  argTypes: {
    accent: { control: { type: 'select' }, options: [undefined, ...Object.values(accents)] },
    menu: { control: false },
    pages: { control: false }
  },
  args: {
    accent: undefined,
    canRedo: false,
    canUndo: false,
    dirty: false,
    menu: <MenuItem onClick={() => undefined}>Save as new…</MenuItem>,
    onAddPage: () => undefined,
    onBack: () => undefined,
    onPageChange: () => undefined,
    onRedo: () => undefined,
    onSave: () => undefined,
    onUndo: () => undefined,
    pageId: 'page-1',
    pages: [{ label: 'Page 1', value: 'page-1' }],
    saving: false
  },
  // Keyed on the pages, so changing them in the controls starts the demo over.
  render: args => <Demo {...args} key={args.pages.map(page => page.value).join()} />
} satisfies Meta<DemoProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A saved profile with one page: nothing to save, so Save is greyed out. */
export const Default = {} satisfies Story;

/** With changes to save, which can be undone: Save turns to the accent. */
export const Unsaved = {
  args: { canUndo: true, dirty: true, pageId: 'flight', pages: twoPages }
} satisfies Story;

export const Saving = {
  args: { canUndo: true, dirty: true, pageId: 'flight', pages: twoPages, saving: true }
} satisfies Story;

/** The logomark takes the accent of the page shown, here Phosphor's. */
export const PageAccent = {
  args: { accent: accents.Phosphor, pageId: 'flight', pages: twoPages }
} satisfies Story;

export const PageAccentAmber = {
  args: { accent: accents['Amber CRT'], pageId: 'flight', pages: twoPages }
} satisfies Story;

/** Tabs that don't fit go into a menu; the page shown is always one of those in view. */
export const ManyPages = {
  args: {
    pageId: 'mining',
    pages: ['Flight', 'Combat', 'Shields', 'Power', 'Landing', 'Quantum', 'Mining', 'Salvage'].map(label => ({
      label,
      value: label.toLowerCase()
    }))
  },
  globals: tablet
} satisfies Story;

/** On a phone, the logomark gives way, and undo and redo move into `⋯`, so the tabs have the row. */
export const Phone = { args: { pageId: 'flight', pages: twoPages }, globals: phone } satisfies Story;

export const PhoneUnsaved = {
  args: { canUndo: true, dirty: true, pageId: 'flight', pages: twoPages },
  globals: phone
} satisfies Story;

/** On a phone, `⋯` holds the other profile actions, then undo and redo. */
export const PhoneMenu = {
  args: { canUndo: true, dirty: true, pageId: 'flight', pages: twoPages },
  globals: phone,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'More' }));
    await expect(await screen.findByRole('menuitem', { name: 'Undo' })).not.toHaveAttribute('aria-disabled', 'true');
    await expect(screen.getByRole('menuitem', { name: 'Redo' })).toHaveAttribute('aria-disabled', 'true');
  }
} satisfies Story;

/** "+" adds a page at the end and shows it. */
export const AddingAPage = {
  tags: ['!dev', '!visual'],
  play: async ({ canvasElement }) => {
    const header = within(canvasElement);

    await userEvent.click(header.getByRole('button', { name: 'Add a page' }));
    await expect(header.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true');
  }
} satisfies Story;

/** Every profile action but Save is in `⋯`; undo and redo only join it on a phone. */
export const MoreMenu = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'More' }));
    await expect(await screen.findByRole('menuitem', { name: 'Save as new…' })).toBeVisible();
    await expect(screen.queryByRole('menuitem', { name: 'Undo' })).toBeNull();
  }
} satisfies Story;
