import type { Layout, Page, SignalDefinition, WidgetInstance } from '@mfdiy/schema';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { builtInThemes, resolveInput, widgetManifests } from '@mfdiy/instruments';
import { DEFAULT_GRID } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';
import { useState } from 'react';

import { Canvas } from './Canvas.js';

const widgets: WidgetInstance[] = [
  { id: 'speed', type: 'readout', options: { label: 'Speed' } },
  { id: 'fuel', type: 'bar', options: { label: 'Fuel' } },
  { id: 'gear', type: 'light', options: { label: 'Gear' } },
  { id: 'esp', type: 'light', options: { label: 'ESP' } },
  { id: 'doors', type: 'label', options: { label: 'Doors' } }
];

const layout: Layout = {
  orientation: 'any',
  grid: DEFAULT_GRID,
  areas: {
    speed: { column: 1, row: 1, columnSpan: 8, rowSpan: 4 },
    fuel: { column: 11, row: 1, columnSpan: 10, rowSpan: 4 },
    gear: { column: 1, row: 7, columnSpan: 4, rowSpan: 4 },
    esp: { column: 5, row: 7, columnSpan: 4, rowSpan: 4 },
    doors: { column: 15, row: 11, columnSpan: 1, rowSpan: 1 }
  }
};

const signals: Record<string, { signal: SignalDefinition; value: number | boolean }> = {
  speed: {
    signal: { id: 'speed', label: 'Speed', group: 'Demo', kind: 'number', min: 0, max: 1200, unit: 'm/s' },
    value: 212
  },
  fuel: {
    signal: { id: 'fuel', label: 'Fuel', group: 'Demo', kind: 'number', min: 0, max: 100, unit: '%' },
    value: 64
  },
  gear: { signal: { id: 'gear', label: 'Gear', group: 'Demo', kind: 'boolean' }, value: true }
};

function renderWidget(widget: WidgetInstance) {
  const manifest = widgetManifests[widget.type];
  const input = signals[widget.id];

  return manifest ? (
    <manifest.Component
      action={undefined}
      inputs={input ? { value: resolveInput(input.signal, input.value, undefined) } : {}}
      options={Object.fromEntries(
        Object.entries(manifest.options).map(([key, spec]) => [key, widget.options?.[key] ?? spec.default])
      )}
    />
  ) : null;
}

type DemoProps = {
  aspectRatio?: number;
  initialLayout: Layout;
  initialSelectedId?: string;
  themeName: string;
  widgets: WidgetInstance[];
};

function Demo({ aspectRatio, initialLayout, initialSelectedId, themeName, widgets }: DemoProps) {
  const [page, setPage] = useState<Page>({ id: 'demo', name: 'Demo', widgets, layouts: [initialLayout] });
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);

  return (
    <Box backgroundColor='surface' height='viewport' padding='5x'>
      <Canvas
        aspectRatio={aspectRatio}
        documentTokens={builtInThemes.find(theme => theme.name === themeName)?.tokens}
        layout={page.layouts[0] ?? initialLayout}
        onChange={setPage}
        onSelect={setSelectedId}
        page={page}
        renderWidget={renderWidget}
        selectedId={selectedId}
      />
    </Box>
  );
}

const meta = {
  title: 'Builder/Canvas',
  args: { initialLayout: layout, widgets },
  render: (args, context) => <Demo {...args} themeName={String(context.globals['theme'] ?? '')} />
} satisfies Meta<Omit<DemoProps, 'themeName'>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = { args: { initialSelectedId: 'speed' } };

/** Handles must leave room to drag a one-cell widget. */
export const SmallestWidgetSelected: Story = { args: { aspectRatio: 9 / 19, initialSelectedId: 'doors' } };

/** Every widget at the size it starts at: a sixth by a quarter of the page, 4 × 4 cells here (0006). */
export const DefaultSizes: Story = {
  tags: ['!dev'],
  args: {
    aspectRatio: 16 / 10,
    initialLayout: {
      ...layout,
      areas: {
        speed: { column: 1, row: 1, columnSpan: 4, rowSpan: 4 },
        fuel: { column: 6, row: 1, columnSpan: 4, rowSpan: 4 },
        gear: { column: 11, row: 1, columnSpan: 4, rowSpan: 4 },
        doors: { column: 16, row: 1, columnSpan: 4, rowSpan: 4 }
      }
    },
    widgets: widgets.filter(widget => ['speed', 'fuel', 'gear', 'doors'].includes(widget.id))
  }
};

export const Empty: Story = { args: { initialLayout: { ...layout, areas: {} }, widgets: [] } };

/** No free cells: widgets can still be moved, overlapping others meanwhile. */
export const Full: Story = {
  args: {
    initialLayout: {
      ...layout,
      grid: { columns: 2, rows: 2 },
      areas: {
        speed: { column: 1, row: 1, columnSpan: 2, rowSpan: 1 },
        gear: { column: 1, row: 2, columnSpan: 1, rowSpan: 1 },
        esp: { column: 2, row: 2, columnSpan: 1, rowSpan: 1 }
      }
    },
    widgets: widgets.filter(widget => ['speed', 'gear', 'esp'].includes(widget.id))
  }
};

/** One widget partly covered and one completely hidden. Press again to select what's underneath. */
export const Overlapping: Story = {
  args: {
    initialLayout: {
      ...layout,
      areas: {
        ...layout.areas,
        gear: { column: 3, row: 1, columnSpan: 4, rowSpan: 4 },
        esp: { column: 12, row: 6, columnSpan: 8, rowSpan: 8 }
      }
    },
    widgets: [...widgets.filter(widget => widget.id === 'doors'), ...widgets.filter(widget => widget.id !== 'doors')]
  }
};

export const PhonePortrait: Story = { args: { aspectRatio: 9 / 19 } };

export const TabletLandscape: Story = { args: { aspectRatio: 4 / 3 } };

export const SquarePanel: Story = { args: { aspectRatio: 1 } };
