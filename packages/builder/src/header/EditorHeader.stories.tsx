import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box, MenuItem, type TabsItem } from '@mfdiy/ui/components';
import { useState, type ComponentProps } from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { EditorHeader } from './EditorHeader.js';

const widths = { phone: '390px', tablet: '820px', wide: '1280px' } as const;

const twoPages: readonly TabsItem[] = [
  { label: 'Flight', value: 'flight' },
  { label: 'Combat', value: 'combat' }
];

type DemoProps = ComponentProps<typeof EditorHeader> & {
  /** How wide the header is: it changes with its container, not the screen. */
  width: keyof typeof widths;
};

/** Holds the pages and the page shown, so tabs can be switched and added in Storybook. */
function Demo({ onAddPage, onPageChange, pageId: initialPageId, pages: initialPages, width, ...restProps }: DemoProps) {
  const [pages, setPages] = useState(initialPages);
  const [pageId, setPageId] = useState(initialPageId);

  return (
    <div style={{ maxWidth: '100%', width: widths[width] }}>
      <Box backgroundColor='surface' padding='3x'>
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
    </div>
  );
}

const meta = {
  title: 'Builder/EditorHeader',
  component: EditorHeader,
  argTypes: {
    menu: { control: false },
    pages: { control: false },
    status: { control: { type: 'text' } },
    width: { control: { type: 'select' }, options: Object.keys(widths) }
  },
  args: {
    canRedo: false,
    canUndo: false,
    dirty: false,
    failed: false,
    menu: <MenuItem onClick={() => undefined}>Save as new…</MenuItem>,
    name: 'Fighter',
    onAddPage: () => undefined,
    onBack: () => undefined,
    onPageChange: () => undefined,
    onRedo: () => undefined,
    onSave: () => undefined,
    onUndo: () => undefined,
    pageId: 'page-1',
    pages: [{ label: 'Page 1', value: 'page-1' }],
    saving: false,
    status: 'Saved',
    width: 'wide'
  },
  // Keyed on the pages, so changing them in the controls starts the demo over.
  render: args => <Demo {...args} key={args.pages.map(page => page.value).join()} />
} satisfies Meta<DemoProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A saved profile with one page. */
export const Default = {} satisfies Story;

/** With changes to save, which can be undone. */
export const Unsaved = {
  args: { canUndo: true, dirty: true, pageId: 'flight', pages: twoPages, status: 'Unsaved changes' }
} satisfies Story;

export const Saving = {
  args: { canUndo: true, dirty: true, pageId: 'flight', pages: twoPages, saving: true, status: 'Saving…' }
} satisfies Story;

/** Saving failed: the status turns critical, and the changes are still there to save again. */
export const Failed = {
  args: {
    canUndo: true,
    dirty: true,
    failed: true,
    pageId: 'flight',
    pages: twoPages,
    status: 'Not saved. The bridge can’t be reached.'
  }
} satisfies Story;

/** Tabs that don't fit go into a menu; the page shown is always one of those in view. */
export const ManyPages = {
  args: {
    pageId: 'mining',
    pages: ['Flight', 'Combat', 'Shields', 'Power', 'Landing', 'Quantum', 'Mining', 'Salvage'].map(label => ({
      label,
      value: label.toLowerCase()
    })),
    width: 'tablet'
  }
} satisfies Story;

/** On a phone the name gives way to the tabs, and a dot on Save stands for the status. */
export const Phone = { args: { pageId: 'flight', pages: twoPages, width: 'phone' } } satisfies Story;

export const PhoneUnsaved = {
  args: { canUndo: true, dirty: true, pageId: 'flight', pages: twoPages, status: 'Unsaved changes', width: 'phone' }
} satisfies Story;

export const PhoneFailed = {
  args: {
    canUndo: true,
    dirty: true,
    failed: true,
    pageId: 'flight',
    pages: twoPages,
    status: 'Not saved. The bridge can’t be reached.',
    width: 'phone'
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

/** Every profile action but Save is in `⋯`. */
export const MoreMenu = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'More' }));
    await expect(await screen.findByRole('menuitem', { name: 'Save as new…' })).toBeVisible();
  }
} satisfies Story;

/** On a phone, Save is still named by the status, for assistive technology. */
export const PhoneSaveDescribed = {
  tags: ['!dev', '!visual'],
  args: { dirty: true, status: 'Unsaved changes', width: 'phone' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Save' })).toHaveAccessibleDescription(
      'Unsaved changes'
    );
  }
} satisfies Story;
