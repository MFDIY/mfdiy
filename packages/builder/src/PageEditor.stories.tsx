import type { Catalogue } from './palette/choices.js';
import type { ProfileSettings } from './properties/ProfileProperties.js';
import type { CopiedWidget, Page, SharedSubgrid, WidgetInstance } from '@mfdiy/schema';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { builtInThemes, resolveInput, widgetManifests } from '@mfdiy/instruments';
import { addWidget, createBlankDocument, gameActionOf, shapeRatio } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';
import { useState } from 'react';
import { expect, screen, waitFor, within } from 'storybook/test';

import { PageEditor } from './PageEditor.js';
import { usesCommandKey } from './keys.js';

const catalogue: Catalogue = {
  signals: [
    { id: 'speed', label: 'Speed', group: 'Flight', kind: 'number', min: 0, max: 1200, unit: 'm/s' },
    { id: 'fuel', label: 'Fuel', group: 'Vehicle', kind: 'number', min: 0, max: 100, unit: '%' },
    { id: 'gear', label: 'Gear', group: 'Vehicle', kind: 'boolean' }
  ],
  actions: [{ id: 'gear-toggle', label: 'Landing gear', group: 'Vehicle', holdable: false }]
};

function renderWidget(widget: WidgetInstance) {
  const manifest = widgetManifests[widget.type];
  const binding = widget.bindings?.['value'];
  const signal = catalogue.signals.find(candidate => candidate.id === binding?.signal);
  const action = catalogue.actions.find(candidate => candidate.id === gameActionOf(widget));

  return manifest ? (
    <manifest.Component
      action={action && { available: true, label: action.label, status: 'idle', trigger: () => undefined }}
      inputs={signal ? { value: resolveInput(signal, signal.kind === 'boolean' ? true : 64, binding) } : {}}
      options={Object.fromEntries(
        Object.entries(manifest.options).map(([key, spec]) => [key, widget.options?.[key] ?? spec.default])
      )}
    />
  ) : null;
}

const blankDocument = createBlankDocument('Demo', 'demo');
const blankPage = blankDocument.pages[0] as Page;
const blankProfile: ProfileSettings = { fit: blankDocument.fit, name: blankDocument.name, shape: blankDocument.shape };
const [blankLayout] = blankPage.layouts;

/** A page with one fuel bar on it, to select. */
const pageWithBar: Page = blankLayout
  ? addWidget(
      blankPage,
      blankLayout,
      { id: 'fuel', type: 'bar', bindings: { value: { signal: 'fuel' } } },
      { column: 3, row: 3, columnSpan: 6, rowSpan: 4 }
    )
  : blankPage;

/** A strip along the bottom of the page with two page buttons, as starter profiles have (0026). */
const strip: SharedSubgrid = {
  areas: {
    'show-flight': { column: 1, row: 1, columnSpan: 4, rowSpan: 2 },
    'show-combat': { column: 5, row: 1, columnSpan: 4, rowSpan: 2 }
  },
  grid: { columns: 24, rows: 2 },
  id: 'subgrid-1',
  place: { area: { column: 1, row: 14, columnSpan: 24, rowSpan: 2 }, grid: { columns: 24, rows: 15 } },
  widgets: [
    { id: 'show-flight', type: 'button', options: { label: 'Flight' }, action: { page: 'page-1' } },
    { id: 'show-combat', type: 'button', options: { label: 'Combat' }, action: { page: 'combat' } }
  ]
};

/** A page whose bar reaches under the strip: overlap, in red (0026). */
const pageUnderStrip: Page = blankLayout
  ? addWidget(
      blankPage,
      blankLayout,
      { id: 'fuel', type: 'bar', bindings: { value: { signal: 'fuel' } } },
      { column: 3, row: 10, columnSpan: 6, rowSpan: 5 }
    )
  : blankPage;

/** A fuel bar copied from a page of 12 × 8 cells, to paste on a page of another size (0006). */
const copiedBar: CopiedWidget = {
  area: { column: 2, row: 2, columnSpan: 3, rowSpan: 2 },
  grid: { columns: 12, rows: 8 },
  widget: { id: 'fuel', type: 'bar', bindings: { value: { signal: 'fuel' } } }
};

/** Presses the platform's shortcut for a key, Ctrl or ⌘ with it. */
function shortcut(key: string) {
  const modifier = usesCommandKey ? 'Meta' : 'Control';

  return `{${modifier}>}${key}{/${modifier}}`;
}

type DemoProps = {
  catalogue: Catalogue;
  /** The widget copied before the story starts (0006). */
  copied?: CopiedWidget | null | undefined;
  /** The shared subgrid entered, if any (0026). */
  enteredSubgridId?: string | null | undefined;
  focusPageName?: boolean | undefined;
  page?: Page | undefined;
  /** At a phone's width, where the panels are sheets (0008). */
  phone?: boolean | undefined;
  selectedId?: string | null | undefined;
  /** The profile's shared subgrids (0026). */
  subgrids?: SharedSubgrid[] | undefined;
  themeName: string;
};

function Demo({
  catalogue,
  copied: initialCopied = null,
  enteredSubgridId: initialEntered = null,
  focusPageName = false,
  page: initialPage = blankPage,
  phone = false,
  selectedId: initialSelection = null,
  subgrids: initialSubgrids = [],
  themeName
}: DemoProps) {
  const [subgrids, setSubgrids] = useState(initialSubgrids);
  const [entered, setEntered] = useState(initialEntered);
  const [page, setPage] = useState(initialPage);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelection);
  const [profile, setProfile] = useState(blankProfile);
  const [copied, setCopied] = useState(initialCopied);
  const [layout] = page.layouts;

  return layout ? (
    <Box backgroundColor='surface' height='viewport' padding='5x'>
      <div style={{ height: '100%', maxWidth: phone ? '390px' : undefined }}>
        <PageEditor
          aspectRatio={shapeRatio(profile.shape)}
          catalogue={catalogue}
          copied={copied}
          documentTokens={builtInThemes.find(theme => theme.name === themeName)?.tokens}
          enteredSubgridId={entered}
          focusPageName={focusPageName}
          layout={layout}
          onChange={setPage}
          onCopy={setCopied}
          onDeletePage={() => undefined}
          onDuplicatePage={() => undefined}
          onEnterSubgrid={id => {
            setEntered(id);
            setSelectedId(null);
          }}
          onProfileChange={setProfile}
          onSelect={setSelectedId}
          onSubgridsChange={setSubgrids}
          page={page}
          pages={[page, { id: 'combat', name: 'Combat' }]}
          profile={profile}
          renderWidget={renderWidget}
          selectedId={selectedId}
          subgrids={subgrids}
        />
      </div>
    </Box>
  ) : null;
}

const meta = {
  title: 'Builder/PageEditor',
  args: { catalogue },
  render: (args, context) => <Demo {...args} themeName={String(context.globals['theme'] ?? '')} />
} satisfies Meta<Omit<DemoProps, 'themeName'>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An empty page: tap a cell, or drag a widget from the library onto it. */
export const Default: Story = {};

/** Before the bridge has sent anything, widgets can still be added; their properties say there's nothing to connect them to. */
export const NothingToChooseFrom: Story = { args: { catalogue: { signals: [], actions: [] } } };

/** The canvas's grid, to press or drop on. */
function gridOf(canvasElement: HTMLElement) {
  const grid = within(canvasElement).getByRole('group', { name: /^Page / }).firstElementChild;

  if (!(grid instanceof HTMLElement)) {
    throw new Error('No grid to press');
  }

  const { left, top, width, height } = grid.getBoundingClientRect();

  return { grid, at: (x: number, y: number) => ({ clientX: left + width * x, clientY: top + height * y }) };
}

/**
 * Every widget starts at the same size (0006), so the spot marked for the new widget doesn't grow
 * while one is highlighted in the library.
 */
export const MarkedCellWithBarHighlighted: Story = {
  tags: ['!dev'],
  play: async ({ canvasElement, userEvent }) => {
    const { grid, at } = gridOf(canvasElement);

    await userEvent.pointer({ keys: '[MouseLeft]', target: grid, coords: at(0.3, 0.4) });
    await userEvent.hover(await screen.findByRole('option', { name: /^Bar/ }));

    await expect(screen.getByRole('option', { name: /^Bar/ })).toHaveAttribute('data-highlighted');
  }
};

/** Mark a cell and pick a widget: it's added there, and its properties ask what it shows (0023). */
export const AddByMarkingACell: Story = {
  tags: ['!dev', '!visual'],
  play: async ({ canvasElement, userEvent }) => {
    const { grid, at } = gridOf(canvasElement);

    await userEvent.pointer({ keys: '[MouseLeft]', target: grid, coords: at(0.3, 0.4) });
    await userEvent.click(screen.getByRole('option', { name: /^Light/ }));

    await expect(within(canvasElement).getByRole('button', { name: 'Light' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Signal: Not connected' }));
    await userEvent.click(await screen.findByRole('option', { name: /^Gear/ }));

    await expect(within(canvasElement).getByRole('button', { name: 'Light gear' })).toBeInTheDocument();
  }
};

/** Drag a widget from the library onto the canvas: it's added where it's dropped. */
export const AddByDragging: Story = {
  tags: ['!dev', '!visual'],
  play: async ({ canvasElement, userEvent }) => {
    const { grid, at } = gridOf(canvasElement);
    const bar = screen.getByRole('option', { name: /^Bar/ });

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: bar },
      { target: grid, coords: at(0.5, 0.5) },
      { target: grid, coords: at(0.6, 0.6) },
      { keys: '[/MouseLeft]', target: grid, coords: at(0.6, 0.6) }
    ]);

    await expect(within(canvasElement).getByRole('button', { name: 'Bar' })).toBeInTheDocument();
  }
};

/** With no cell marked, clicking can't add anything; after a couple of tries, a toast says how. */
export const HintAfterIdleClicks: Story = {
  tags: ['!dev', '!visual'],
  play: async ({ userEvent }) => {
    const bar = screen.getByRole('option', { name: /^Bar/ });

    await userEvent.click(bar);
    await userEvent.click(bar);

    await expect(await screen.findByText('Tap a cell, or drag a widget onto the page.')).toBeInTheDocument();
  }
};

/** The library lists widget types; searching narrows them down. */
export const SearchFindsWidgets: Story = {
  tags: ['!dev', '!visual'],
  play: async ({ userEvent }) => {
    await userEvent.type(screen.getByRole('combobox'), 'rea');

    await expect(screen.getAllByRole('option')).toHaveLength(1);
    await expect(screen.getByRole('option', { name: /^Readout/ })).toBeInTheDocument();
  }
};

/** Clicking the white space around the page lets go of the selected widget, as anywhere else (0024). */
export const DeselectingOutsideThePage: Story = {
  tags: ['!dev', '!visual'],
  args: { page: pageWithBar, selectedId: 'fuel' },
  play: async ({ canvasElement, userEvent }) => {
    const viewport = canvasElement.querySelector('[data-canvas="viewport"]');

    if (!(viewport instanceof HTMLElement)) {
      throw new Error('No canvas');
    }

    const { left, top } = viewport.getBoundingClientRect();

    await expect(within(canvasElement).getByRole('button', { name: 'Bar fuel' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: viewport, coords: { clientX: left + 4, clientY: top + 4 } },
      { keys: '[/MouseLeft]', target: viewport, coords: { clientX: left + 4, clientY: top + 4 } }
    ]);
    await expect(within(canvasElement).getByRole('button', { name: 'Bar fuel' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  }
};

/** On a phone, the properties sheet never leaves: with nothing to edit, it peeks with its title (0008). */
export const PhonePeeking: Story = {
  args: { page: pageWithBar, phone: true }
};

/** Selecting a widget opens its properties half way, keeping the canvas in view above. */
export const PhoneSelecting: Story = {
  tags: ['!dev', '!visual'],
  args: { page: pageWithBar, phone: true },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Bar fuel' }));

    const sheet = await screen.findByRole('dialog', { name: 'Fuel' });

    await waitFor(() => expect(within(sheet).queryByRole('button', { name: 'Open Fuel' })).not.toBeInTheDocument());
  }
};

/** A widget's properties on a phone, half open, with the canvas above: the sheet's title names it. */
export const PhoneEditing: Story = {
  args: { page: pageWithBar, phone: true, selectedId: 'fuel' },
  play: async ({ userEvent }) => {
    await userEvent.click(screen.getByRole('button', { name: 'Open Fuel' }));

    const sheet = await screen.findByRole('dialog', { name: 'Fuel' });

    await waitFor(() => expect(within(sheet).queryByRole('button', { name: 'Open Fuel' })).not.toBeInTheDocument());
    await Promise.all(sheet.getAnimations().map(animation => animation.finished));
  }
};

/** Choosing a widget's data on a phone stacks a modal sheet on the properties (0008). */
export const PhonePickingData: Story = {
  args: { page: pageWithBar, phone: true, selectedId: 'fuel' },
  play: async ({ userEvent }) => {
    await userEvent.click(screen.getByRole('button', { name: 'Open Fuel' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Signal: Fuel' }));

    const task = await screen.findByRole('dialog', { name: 'Value' });

    await waitFor(() => expect(task).not.toHaveAttribute('data-starting-style'));
    await Promise.all(task.getAnimations().map(animation => animation.finished));
    await expect(within(task).getByRole('option', { name: /^Speed/ })).toBeInTheDocument();
  }
};

/** A page just duplicated, on a phone: its properties open half-way, with the name ready to rename (0023). */
export const PhonePageJustDuplicated: Story = {
  args: { focusPageName: true, page: { ...pageWithBar, name: 'Page 1 (clone)' }, phone: true },
  play: async () => {
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus());
  }
};

/** Whether a focus ring shows after a click depends on earlier stories' typing, so screenshots don't keep focus. */
function blurActive() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

/** Pressing the label above the page shows the profile's settings: its name, its shape, and what displays do with it (0006). */
export const ShowingProfileSettings: Story = {
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /^Demo · Page 1/ }));
    await expect(await screen.findByRole('textbox', { name: 'Shape' })).toHaveValue('16:10');
    blurActive();
  }
};

/** A new shape reshapes the page, and its grid stays as it is: the cells stretch (0006). */
export const ReshapingTheProfile: Story = {
  tags: ['!dev'],
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /^Demo · Page 1/ }));
    await userEvent.click(await screen.findByRole('button', { name: '4:3' }));
    await expect(within(canvasElement).getByRole('button', { name: /^Demo · Page 1/ })).toHaveTextContent(
      '4:3 · 24 × 15'
    );
    blurActive();
  }
};

/** On a phone, the profile's settings open in the properties sheet. */
export const PhoneProfileSettings: Story = {
  args: { phone: true },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /^Demo · Page 1/ }));

    const sheet = await screen.findByRole('dialog', { name: 'Profile' });

    await waitFor(() => expect(within(sheet).getByRole('textbox', { name: 'Shape' })).toBeVisible());
    await Promise.all(sheet.getAnimations().map(animation => animation.finished));
    blurActive();
  }
};

/** The hatching around an entered subgrid, which a press there reaches. */
function coverOf(canvasElement: HTMLElement) {
  const cover = canvasElement.querySelector('[data-canvas="cover"]');

  if (!(cover instanceof HTMLElement)) {
    throw new Error('No cover');
  }

  const { left, top } = cover.getBoundingClientRect();

  return { cover, coords: { clientX: left + 20, clientY: top + 20 } };
}

/** A shared subgrid on the page: one widget, its contents under a neutral hatching (0026). */
export const SharedSubgridOnThePage: Story = { args: { page: pageWithBar, subgrids: [strip] } };

/** A page's widget under a shared subgrid is overlap, in red, as between widgets (0026). */
export const SharedSubgridOverlap: Story = { args: { page: pageUnderStrip, subgrids: [strip] } };

/** Selected, its properties show its columns × rows and Edit subgrid (0026). */
export const SharedSubgridSelected: Story = {
  args: { page: pageWithBar, selectedId: 'shared-subgrid:subgrid-1', subgrids: [strip] }
};

/** Entered: the hatching covers the page with the subgrid cut out, and its widgets can be edited (0026). */
export const InsideASharedSubgrid: Story = {
  args: { enteredSubgridId: 'subgrid-1', page: pageUnderStrip, subgrids: [strip] }
};

/** Inside, a widget's properties are as on a page; the panel follows one level down (0026). */
export const InsideASharedSubgridEditingAWidget: Story = {
  args: { enteredSubgridId: 'subgrid-1', page: pageWithBar, selectedId: 'show-combat', subgrids: [strip] }
};

/** Added from the library like any widget: empty, and selected (0026). */
export const AddingASharedSubgrid: Story = {
  tags: ['!dev', '!visual'],
  args: { page: pageWithBar },
  play: async ({ canvasElement, userEvent }) => {
    const { grid, at } = gridOf(canvasElement);

    await userEvent.pointer({ keys: '[MouseLeft]', target: grid, coords: at(0.8, 0.2) });
    await userEvent.click(screen.getByRole('option', { name: /^Shared subgrid/ }));

    await expect(within(canvasElement).getByRole('button', { name: 'Shared subgrid' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(screen.getByRole('button', { name: 'Edit subgrid' })).toBeInTheDocument();
  }
};

function doublePress(target: HTMLElement, coords: { clientX: number; clientY: number }) {
  return [
    { keys: '[MouseLeft>]', target, coords },
    { keys: '[/MouseLeft]', target, coords },
    { keys: '[MouseLeft>]', target, coords },
    { keys: '[/MouseLeft]', target, coords }
  ];
}

/** Double-tapping a shared subgrid enters it (0026). */
export const DoubleTapToEnter: Story = {
  tags: ['!dev', '!visual'],
  args: { page: pageWithBar, subgrids: [strip] },
  play: async ({ canvasElement, userEvent }) => {
    const subgrid = within(canvasElement).getByRole('button', { name: 'Shared subgrid' });
    const { left, top } = subgrid.getBoundingClientRect();

    await userEvent.pointer(doublePress(subgrid, { clientX: left + 200, clientY: top + 10 }));
    await expect(screen.getByRole('button', { name: 'Exit subgrid' })).toBeInTheDocument();
  }
};

/** Inside, a single tap on the hatching stays inside; a double tap leaves (0026). */
export const DoubleTapToLeave: Story = {
  tags: ['!dev', '!visual'],
  args: { page: pageWithBar, selectedId: 'shared-subgrid:subgrid-1', subgrids: [strip] },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(screen.getByRole('button', { name: 'Edit subgrid' }));
    await expect(within(canvasElement).getByRole('button', { name: 'Button Flight' })).toBeInTheDocument();

    const { cover, coords } = coverOf(canvasElement);

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: cover, coords },
      { keys: '[/MouseLeft]', target: cover, coords }
    ]);
    await new Promise(resolve => setTimeout(resolve, 500));
    await expect(screen.getByRole('button', { name: 'Exit subgrid' })).toBeInTheDocument();

    await userEvent.pointer(doublePress(cover, coords));
    await expect(within(canvasElement).getByRole('button', { name: 'Shared subgrid' })).toBeInTheDocument();
  }
};

/** Inside, the first press on the hatching only lets go of the selected widget; Escape leaves (0026). */
export const LeavingWithASelection: Story = {
  tags: ['!dev', '!visual'],
  args: { enteredSubgridId: 'subgrid-1', page: pageWithBar, selectedId: 'show-combat', subgrids: [strip] },
  play: async ({ canvasElement, userEvent }) => {
    const { cover, coords } = coverOf(canvasElement);

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: cover, coords },
      { keys: '[/MouseLeft]', target: cover, coords }
    ]);
    await expect(screen.getByRole('button', { name: 'Exit subgrid' })).toBeInTheDocument();

    blurActive();
    await userEvent.keyboard('{Escape}');
    await expect(within(canvasElement).getByRole('button', { name: 'Shared subgrid' })).toBeInTheDocument();
  }
};

/** Pasted on a grid of another size, a copy covers the same share of it, and is selected (0006). */
export const PastedOntoAnotherGrid: Story = {
  tags: ['!dev'],
  args: { copied: copiedBar },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.keyboard(shortcut('v'));
    await expect(within(canvasElement).getByRole('button', { name: 'Bar fuel' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  }
};

/** Copying the selected widget and pasting it puts a copy on top of it, in the same cells (0006). */
export const CopyAndPaste: Story = {
  tags: ['!dev', '!visual'],
  args: { page: pageWithBar, selectedId: 'fuel' },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.keyboard(shortcut('c'));
    await userEvent.keyboard(shortcut('v'));

    const bars = canvas.getAllByRole('button', { name: 'Bar fuel' });

    await expect(bars).toHaveLength(2);
    await expect(bars[0]).toHaveAttribute('aria-pressed', 'false');
    await expect(bars[1]).toHaveAttribute('aria-pressed', 'true');
    await expect(bars[1]?.getBoundingClientRect()).toEqual(bars[0]?.getBoundingClientRect());
  }
};

/** A shared subgrid isn't copied: every page has it already (0026). */
export const SharedSubgridIsNotCopied: Story = {
  tags: ['!dev', '!visual'],
  args: { page: pageWithBar, selectedId: 'shared-subgrid:subgrid-1', subgrids: [strip] },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.keyboard(shortcut('c'));
    await userEvent.keyboard(shortcut('v'));
    await expect(within(canvasElement).getAllByRole('button', { name: 'Shared subgrid' })).toHaveLength(1);
  }
};

/** Inside a shared subgrid, Paste adds the copy to the subgrid, not to the page around it (0006, 0026). */
export const PastedIntoASharedSubgrid: Story = {
  tags: ['!dev', '!visual'],
  args: { copied: copiedBar, enteredSubgridId: 'subgrid-1', page: pageWithBar, subgrids: [strip] },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.keyboard(shortcut('v'));

    const pasted = canvas.getAllByRole('button', { name: 'Bar fuel' }).find(bar => bar.ariaPressed === 'true');

    await expect(pasted).toBeDefined();
    await expect(canvas.getAllByRole('button', { name: /^Button / })).toHaveLength(2);
  }
};

/** Typing keeps its own copy and paste: the shortcuts leave text fields alone. */
export const ShortcutsLeaveTextFieldsAlone: Story = {
  tags: ['!dev', '!visual'],
  args: { copied: copiedBar },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard(shortcut('v'));
    await expect(within(canvasElement).queryByRole('button', { name: 'Bar fuel' })).not.toBeInTheDocument();
  }
};
