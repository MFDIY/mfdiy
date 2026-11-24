import type { MfdDocument } from '@mfdiy/schema';

/** A hand-written document used until the builder can create one. */
export const demoDocument: MfdDocument = {
  schema: 1,
  name: 'Demo',
  game: 'star-citizen',
  pages: [
    {
      id: 'flight',
      name: 'Flight',
      grid: { columns: 4, rows: 4 },
      widgets: [
        {
          id: 'speed',
          type: 'readout',
          area: { column: 1, row: 1, columnSpan: 2, rowSpan: 1 },
          bindings: { value: { signal: 'flight.speed' } }
        },
        {
          id: 'mode',
          type: 'readout',
          area: { column: 3, row: 1, columnSpan: 2, rowSpan: 1 },
          bindings: { value: { signal: 'flight.master-mode' } }
        },
        {
          id: 'hydrogen',
          type: 'bar',
          area: { column: 1, row: 2, columnSpan: 2, rowSpan: 1 },
          bindings: { value: { signal: 'fuel.hydrogen' } }
        },
        {
          id: 'quantum',
          type: 'bar',
          area: { column: 3, row: 2, columnSpan: 2, rowSpan: 1 },
          bindings: { value: { signal: 'fuel.quantum' } }
        },
        {
          id: 'gear',
          type: 'light',
          area: { column: 1, row: 3, columnSpan: 1, rowSpan: 1 },
          options: { label: 'Gear' },
          bindings: { value: { signal: 'vehicle.gear-down' } },
          action: 'vehicle.gear-toggle'
        },
        {
          id: 'decoupled',
          type: 'light',
          area: { column: 2, row: 3, columnSpan: 1, rowSpan: 1 },
          options: { label: 'Decpl', litState: 'caution' },
          bindings: { value: { signal: 'ifcs.decoupled' } },
          action: 'ifcs.decouple-toggle'
        },
        {
          id: 'esp',
          type: 'light',
          area: { column: 3, row: 3, columnSpan: 1, rowSpan: 1 },
          options: { label: 'ESP' },
          bindings: { value: { signal: 'ifcs.esp' } },
          action: 'ifcs.esp-toggle'
        },
        {
          id: 'g-safe',
          type: 'light',
          area: { column: 4, row: 3, columnSpan: 1, rowSpan: 1 },
          options: { label: 'G-safe' },
          bindings: { value: { signal: 'ifcs.g-safe' } },
          action: 'ifcs.g-safe-toggle'
        },
        {
          id: 'lights',
          type: 'button',
          area: { column: 1, row: 4, columnSpan: 2, rowSpan: 1 },
          options: { label: 'Lights' },
          action: 'vehicle.lights-toggle'
        },
        {
          id: 'doors',
          type: 'button',
          area: { column: 3, row: 4, columnSpan: 2, rowSpan: 1 },
          options: { label: 'Doors' },
          action: 'vehicle.doors-toggle'
        }
      ]
    },
    {
      id: 'shields',
      name: 'Shields',
      grid: { columns: 2, rows: 3 },
      widgets: [
        {
          id: 'front',
          type: 'bar',
          area: { column: 1, row: 1, columnSpan: 2, rowSpan: 1 },
          bindings: { value: { signal: 'shields.front' } }
        },
        {
          id: 'left',
          type: 'bar',
          area: { column: 1, row: 2, columnSpan: 1, rowSpan: 1 },
          bindings: { value: { signal: 'shields.left' } }
        },
        {
          id: 'right',
          type: 'bar',
          area: { column: 2, row: 2, columnSpan: 1, rowSpan: 1 },
          bindings: { value: { signal: 'shields.right' } }
        },
        {
          id: 'rear',
          type: 'bar',
          area: { column: 1, row: 3, columnSpan: 1, rowSpan: 1 },
          bindings: { value: { signal: 'shields.rear' } }
        },
        {
          id: 'hull',
          type: 'bar',
          area: { column: 2, row: 3, columnSpan: 1, rowSpan: 1 },
          bindings: { value: { signal: 'hull' } }
        }
      ],
      tokens: { 'color.primary': '#5ad8ff', 'color.dim': '#1f5a73', 'color.off': '#0a1c24' }
    }
  ]
};
