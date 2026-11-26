import type { Catalogue } from './palette/choices.js';
import type { Page, WidgetInstance } from '@mfdiy/schema';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { builtInThemes, widgetManifests } from '@mfdiy/instruments';
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
  const signal = catalogue.signals.find(candidate => candidate.id === widget.bindings?.['value']?.signal);
  const action = catalogue.actions.find(candidate => candidate.id === widget.action);

  return manifest ? (
    <manifest.Component
      action={action && { available: true, label: action.label, status: 'idle', trigger: () => undefined }}
      inputs={signal ? { value: { signal, value: signal.kind === 'boolean' ? true : 64 } } : {}}
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

/** Tap an empty cell to add a widget. */
export const EmptyPage: Story = {};

/** Widgets can't be added before the bridge has sent what they can be connected to. */
export const NothingToChooseFrom: Story = { args: { catalogue: { signals: [], actions: [] } } };

/**
 * Every widget starts at the same size (0006), so the spot marked for the new widget doesn't grow
 * under the palette while one is highlighted.
 */
export const PaletteWithBarHighlighted: Story = {
  tags: ['!dev'],
  play: async ({ canvasElement, userEvent }) => {
    const grid = within(canvasElement).getByRole('group', { name: /^Canvas/ }).firstElementChild;

    if (!(grid instanceof HTMLElement)) {
      throw new Error('No grid to press');
    }

    const { left, top, width, height } = grid.getBoundingClientRect();

    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: grid,
      coords: { clientX: left + width * 0.3, clientY: top + height * 0.4 }
    });
    await userEvent.keyboard('{ArrowDown}');

    await expect(await screen.findByRole('option', { name: /^Bar/ })).toHaveAttribute('aria-selected', 'true');
  }
};
