import type { Layout, Page, SignalDefinition, WidgetInstance } from '@mfdiy/schema';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { builtInThemes, widgetManifests } from '@mfdiy/instruments';
import { DEFAULT_GRID } from '@mfdiy/schema';
import { useState } from 'react';

import { Canvas } from './Canvas.js';

const widgets: WidgetInstance[] = [
  { id: 'speed', type: 'readout', options: { label: 'Speed' } },
  { id: 'fuel', type: 'bar', options: { label: 'Fuel' } },
  { id: 'gear', type: 'light', options: { label: 'Gear' } },
  { id: 'esp', type: 'light', options: { label: 'ESP' } },
  { id: 'doors', type: 'button', options: { label: 'Doors' } }
];

const layout: Layout = {
  orientation: 'any',
  grid: DEFAULT_GRID,
  areas: {
    speed: { column: 1, row: 1, columnSpan: 4, rowSpan: 2 },
    fuel: { column: 6, row: 1, columnSpan: 5, rowSpan: 2 },
    gear: { column: 1, row: 4, columnSpan: 2, rowSpan: 2 },
    esp: { column: 3, row: 4, columnSpan: 2, rowSpan: 2 },
    doors: { column: 8, row: 6, columnSpan: 1, rowSpan: 1 }
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
      inputs={input ? { value: input } : {}}
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
  const [current, setCurrent] = useState(initialLayout);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const page: Page = { id: 'demo', name: 'Demo', widgets, layouts: [current] };

  return (
    <div style={{ background: '#222', boxSizing: 'border-box', height: '100vh', padding: 24 }}>
      <Canvas
        aspectRatio={aspectRatio}
        documentTokens={builtInThemes.find(theme => theme.name === themeName)?.tokens}
        layout={current}
        onLayoutChange={setCurrent}
        onSelect={setSelectedId}
        page={page}
        renderWidget={renderWidget}
        selectedId={selectedId}
      />
    </div>
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

export const Empty: Story = { args: { initialLayout: { ...layout, areas: {} }, widgets: [] } };

/** No free cells: every drag is refused until something is made smaller. */
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

export const PhonePortrait: Story = { args: { aspectRatio: 9 / 19 } };

export const TabletLandscape: Story = { args: { aspectRatio: 4 / 3 } };

export const SquarePanel: Story = { args: { aspectRatio: 1 } };
