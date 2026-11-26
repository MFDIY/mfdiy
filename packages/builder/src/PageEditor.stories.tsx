import type { Catalogue } from './palette/choices.js';
import type { Page, WidgetInstance } from '@mfdiy/schema';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { builtInThemes, resolveInput, widgetManifests } from '@mfdiy/instruments';
import { createBlankDocument } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';
import { useState } from 'react';
import { expect, screen, within } from 'storybook/test';

import { PageEditor } from './PageEditor.js';

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
  const action = catalogue.actions.find(candidate => candidate.id === widget.action);

  return manifest ? (
    <manifest.Component
      action={action && { available: true, label: action.label, status: 'idle', trigger: () => undefined }}
      inputs={signal ? { value: resolveInput(signal, signal.kind === 'boolean' ? true : 64, binding) } : {}}
      options={Object.fromEntries(Object.entries(manifest.options).map(([key, spec]) => [key, spec.default]))}
    />
  ) : null;
}

type DemoProps = { catalogue: Catalogue; themeName: string };

function Demo({ catalogue, themeName }: DemoProps) {
  const [page, setPage] = useState(createBlankDocument('Demo', 'demo').pages[0] as Page);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layout] = page.layouts;

  return layout ? (
    <Box backgroundColor='surface' height='viewport' padding='5x'>
      <PageEditor
        catalogue={catalogue}
        documentTokens={builtInThemes.find(theme => theme.name === themeName)?.tokens}
        layout={layout}
        onChange={setPage}
        onSelect={setSelectedId}
        page={page}
        renderWidget={renderWidget}
        selectedId={selectedId}
      />
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
  const grid = within(canvasElement).getByRole('group', { name: /^Canvas/ }).firstElementChild;

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

    await userEvent.click(screen.getByRole('button', { name: 'Lit by: none' }));
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
