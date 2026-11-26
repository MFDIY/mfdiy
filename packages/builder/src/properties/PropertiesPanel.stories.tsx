import type { Catalogue } from '../palette/choices.js';
import type { Layout, Page as PageData } from '@mfdiy/schema';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { builtInThemes } from '@mfdiy/instruments';
import { Box } from '@mfdiy/ui/components';
import { useState } from 'react';
import { expect, screen, within } from 'storybook/test';

import { PropertiesPanel } from './PropertiesPanel.js';

const catalogue: Catalogue = {
  signals: [
    {
      id: 'fuel',
      label: 'Hydrogen fuel',
      group: 'Fuel',
      kind: 'number',
      min: 0,
      max: 100,
      unit: '%',
      thresholds: { low: { warning: 25, critical: 10 } }
    },
    {
      id: 'g-force',
      label: 'G-force',
      group: 'Flight',
      kind: 'number',
      min: -10,
      max: 15,
      unit: 'g',
      thresholds: { high: { warning: 7, critical: 9 }, low: { warning: -3, critical: -5 } }
    },
    { id: 'speed', label: 'Speed', group: 'Flight', kind: 'number', min: 0, max: 1400, unit: 'm/s' },
    { id: 'gear', label: 'Landing gear down', group: 'Vehicle', kind: 'boolean' },
    {
      id: 'mode',
      label: 'Master mode',
      group: 'Flight',
      kind: 'enum',
      options: [
        { value: 'scm', label: 'SCM' },
        { value: 'nav', label: 'NAV' }
      ]
    }
  ],
  actions: [
    { id: 'gear-toggle', label: 'Landing gear', group: 'Vehicle', holdable: false },
    { id: 'lights-toggle', label: 'Lights', group: 'Vehicle', holdable: false }
  ]
};

const layout: Layout = {
  orientation: 'any',
  grid: { columns: 24, rows: 16 },
  areas: {
    fuel: { column: 1, row: 1, columnSpan: 4, rowSpan: 4 },
    'g-force': { column: 5, row: 1, columnSpan: 4, rowSpan: 4 },
    speed: { column: 9, row: 1, columnSpan: 4, rowSpan: 4 },
    gear: { column: 13, row: 1, columnSpan: 4, rowSpan: 4 },
    lights: { column: 17, row: 1, columnSpan: 4, rowSpan: 4 },
    empty: { column: 1, row: 5, columnSpan: 4, rowSpan: 4 },
    mode: { column: 5, row: 5, columnSpan: 4, rowSpan: 4 },
    'low-fuel': { column: 9, row: 5, columnSpan: 4, rowSpan: 4 }
  }
};

const page: PageData = {
  id: 'flight',
  name: 'Flight',
  layouts: [layout],
  widgets: [
    {
      id: 'fuel',
      type: 'bar',
      bindings: { value: { signal: 'fuel', thresholds: { low: { warning: 25, critical: 10 } } } }
    },
    {
      id: 'g-force',
      type: 'bar',
      options: { label: 'G' },
      bindings: {
        value: {
          signal: 'g-force',
          thresholds: { high: { warning: 7, critical: 9 }, low: { warning: -3, critical: -5 } }
        }
      }
    },
    { id: 'speed', type: 'readout', options: { decimals: 1 }, bindings: { value: { signal: 'speed' } } },
    { id: 'gear', type: 'light', action: 'gear-toggle', bindings: { value: { signal: 'gear' } } },
    { id: 'lights', type: 'button', action: 'lights-toggle' },
    { id: 'empty', type: 'bar' },
    { id: 'mode', type: 'readout', options: { label: 'Mode', decimals: 2 }, bindings: { value: { signal: 'mode' } } },
    {
      id: 'low-fuel',
      type: 'light',
      options: { label: 'Low fuel' },
      bindings: { value: { signal: 'fuel', thresholds: { low: { warning: 10, critical: 20 } } } }
    }
  ]
};

type DemoProps = { catalogue: Catalogue; selectedId: string | null; themeName: string };

/** The panel at the width of the sidebar, keeping its own page and selection so it can be used. */
function Demo({ catalogue, selectedId: initialSelection, themeName }: DemoProps) {
  const [current, setCurrent] = useState(page);
  const [selectedId, setSelectedId] = useState(initialSelection);
  const [currentLayout = layout] = current.layouts;

  return (
    <div style={{ height: '720px', maxHeight: '100dvh' }}>
      <Box backgroundColor='surface' height='full' padding='4x' width='panel'>
        <PropertiesPanel
          catalogue={catalogue}
          documentTokens={builtInThemes.find(theme => theme.name === themeName)?.tokens}
          layout={currentLayout}
          onChange={setCurrent}
          onSelect={setSelectedId}
          page={current}
          selectedId={selectedId}
        />
      </Box>
    </div>
  );
}

const meta = {
  title: 'Builder/PropertiesPanel',
  args: { catalogue, selectedId: null },
  render: (args, context) => <Demo {...args} themeName={String(context.globals['theme'] ?? '')} />
} satisfies Meta<Omit<DemoProps, 'themeName'>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** With nothing selected, the panel shows the page: its name and grid. */
export const Page: Story = {};

/** A fuel bar, warning when low: the signal's default thresholds, copied in when it was picked. */
export const Bar: Story = { args: { selectedId: 'fuel' } };

/** G-force is bad both ways, so both sides are on. */
export const BarWarningBothWays: Story = { args: { selectedId: 'g-force' } };

/** A readout of a number with no default thresholds; both sides are off. */
export const Readout: Story = { args: { selectedId: 'speed' } };

/** A readout of something that isn't a number has no thresholds. */
export const ReadoutOfAChoice: Story = { args: { selectedId: 'mode' } };

/** A light on an on/off signal, which also triggers an action: a lit button. */
export const LightWithAction: Story = { args: { selectedId: 'gear' } };

/** A light on a number, with critical set above warning, so it never warns first. */
export const LightOnANumber: Story = { args: { selectedId: 'low-fuel' } };

/** A button has no data, only an action. */
export const Button: Story = { args: { selectedId: 'lights' } };

/** Just added from the library: not connected to anything yet (0006). */
export const NotConnected: Story = { args: { selectedId: 'empty' } };

/** Choosing a widget's data replaces the panel, with a way back (0008). */
export const PickingData: Story = {
  args: { selectedId: 'fuel' },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Value: Hydrogen fuel' }));

    await expect(await within(canvasElement).findByRole('option', { name: /^Speed/ })).toBeInTheDocument();
    await expect(within(canvasElement).queryByRole('option', { name: /^Landing gear down/ })).not.toBeInTheDocument();
  }
};

/** Each type is shown with the widget's data; those that can't keep everything say what they drop. */
export const PickingType: Story = {
  args: { selectedId: 'gear' },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Type: Light' }));

    await expect(await within(canvasElement).findByRole('option', { name: /^Bar/ })).toBeInTheDocument();
  }
};

/** Changing to a type that can't keep everything asks first, and says what would go (0023). */
export const SwapAsksFirst: Story = {
  args: { selectedId: 'gear' },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Type: Light' }));
    await userEvent.click(await within(canvasElement).findByRole('option', { name: /^Bar/ }));

    await expect(await screen.findByRole('alertdialog', { name: 'Change to Bar?' })).toBeInTheDocument();
    await expect(screen.getByText('Lit by: Landing gear down')).toBeInTheDocument();
  }
};

/** Picking data copies the signal's default thresholds (0023). */
export const PickingDataCopiesDefaults: Story = {
  tags: ['!dev', '!visual'],
  args: { selectedId: 'empty' },
  play: async ({ canvasElement, userEvent }) => {
    const panel = within(canvasElement);

    await userEvent.click(panel.getByRole('button', { name: 'Value: none' }));
    await userEvent.click(await panel.findByRole('option', { name: /^G-force/ }));

    await expect(panel.getByRole('switch', { name: 'Warn when high' })).toBeChecked();
    await expect(panel.getByRole('switch', { name: 'Warn when low' })).toBeChecked();
  }
};

/** Switching a side on shows its levels; switching it off hides them. */
export const SwitchingASide: Story = {
  tags: ['!dev', '!visual'],
  args: { selectedId: 'speed' },
  play: async ({ canvasElement, userEvent }) => {
    const panel = within(canvasElement);

    await expect(panel.queryByRole('textbox', { name: 'Warning' })).not.toBeInTheDocument();
    await userEvent.click(panel.getByRole('switch', { name: 'Warn when high' }));
    await expect(panel.getByRole('textbox', { name: 'Warning' })).toHaveValue('1,050');
  }
};

/** Duplicating selects the copy; removing goes back to the page. */
export const DuplicateAndRemove: Story = {
  tags: ['!dev', '!visual'],
  args: { selectedId: 'fuel' },
  play: async ({ canvasElement, userEvent }) => {
    const panel = within(canvasElement);

    await userEvent.click(panel.getByRole('button', { name: 'Duplicate' }));
    await expect(panel.getByRole('heading', { name: 'Hydrogen fuel' })).toBeInTheDocument();
    await userEvent.click(panel.getByRole('button', { name: 'Remove' }));
    await expect(panel.getByRole('heading', { name: 'Page' })).toBeInTheDocument();
  }
};
