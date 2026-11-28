import type { MfdDocument } from '@mfdiy/schema';

import { DEFAULT_SHAPE, DOCUMENT_SCHEMA_VERSION, scaleLayout, seedGrid } from '@mfdiy/schema';

/** Hand-written on coarse grids, which are easier to read. */
const demo: MfdDocument = {
  schema: DOCUMENT_SCHEMA_VERSION,
  fit: 'contain',
  name: 'Demo',
  game: 'star-citizen',
  shape: DEFAULT_SHAPE,
  pages: [
    {
      id: 'flight',
      name: 'Flight',
      layouts: [
        {
          orientation: 'any',
          grid: { columns: 4, rows: 5 },
          areas: {
            speed: { column: 1, row: 1, columnSpan: 2, rowSpan: 1 },
            mode: { column: 3, row: 1, columnSpan: 2, rowSpan: 1 },
            hydrogen: { column: 1, row: 2, columnSpan: 2, rowSpan: 1 },
            quantum: { column: 3, row: 2, columnSpan: 2, rowSpan: 1 },
            gear: { column: 1, row: 3, columnSpan: 1, rowSpan: 1 },
            decoupled: { column: 2, row: 3, columnSpan: 1, rowSpan: 1 },
            esp: { column: 3, row: 3, columnSpan: 1, rowSpan: 1 },
            'g-safe': { column: 4, row: 3, columnSpan: 1, rowSpan: 1 },
            lights: { column: 1, row: 4, columnSpan: 2, rowSpan: 1 },
            doors: { column: 3, row: 4, columnSpan: 2, rowSpan: 1 }
          }
        }
      ],
      widgets: [
        {
          id: 'speed',
          type: 'readout',

          bindings: { value: { signal: 'flight.speed' } }
        },
        {
          id: 'mode',
          type: 'readout',

          bindings: { value: { signal: 'flight.master-mode' } }
        },
        {
          id: 'hydrogen',
          type: 'bar',

          bindings: { value: { signal: 'fuel.hydrogen' } }
        },
        {
          id: 'quantum',
          type: 'bar',

          bindings: { value: { signal: 'fuel.quantum' } }
        },
        {
          id: 'gear',
          type: 'light',

          options: { label: 'Gear' },
          bindings: { value: { signal: 'vehicle.gear-down' } },
          action: 'vehicle.gear-toggle'
        },
        {
          id: 'decoupled',
          type: 'light',

          options: { label: 'Decpl' },
          bindings: { value: { signal: 'ifcs.decoupled' } },
          action: 'ifcs.decouple-toggle'
        },
        {
          id: 'esp',
          type: 'light',

          options: { label: 'ESP' },
          bindings: { value: { signal: 'ifcs.esp' } },
          action: 'ifcs.esp-toggle'
        },
        {
          id: 'g-safe',
          type: 'light',

          options: { label: 'G-safe' },
          bindings: { value: { signal: 'ifcs.g-safe' } },
          action: 'ifcs.g-safe-toggle'
        },
        {
          id: 'lights',
          type: 'label',

          options: { label: 'Lights' },
          action: 'vehicle.lights-toggle'
        },
        {
          id: 'doors',
          type: 'label',

          options: { label: 'Doors' },
          action: 'vehicle.doors-toggle'
        }
      ]
    },
    {
      id: 'shields',
      name: 'Shields',
      layouts: [
        {
          orientation: 'any',
          grid: { columns: 2, rows: 5 },
          areas: {
            front: { column: 1, row: 1, columnSpan: 2, rowSpan: 1 },
            left: { column: 1, row: 2, columnSpan: 1, rowSpan: 2 },
            right: { column: 2, row: 2, columnSpan: 1, rowSpan: 2 },
            rear: { column: 1, row: 4, columnSpan: 1, rowSpan: 1 },
            hull: { column: 2, row: 4, columnSpan: 1, rowSpan: 1 }
          }
        }
      ],
      widgets: [
        {
          id: 'front',
          type: 'bar',

          bindings: { value: { signal: 'shields.front' } }
        },
        {
          id: 'left',
          type: 'bar',

          bindings: { value: { signal: 'shields.left' } }
        },
        {
          id: 'right',
          type: 'bar',

          bindings: { value: { signal: 'shields.right' } }
        },
        {
          id: 'rear',
          type: 'bar',

          bindings: { value: { signal: 'shields.rear' } }
        },
        {
          id: 'hull',
          type: 'bar',

          bindings: { value: { signal: 'hull' } }
        }
      ],
      tokens: { 'primary.8': '#5ad8ff', 'neutral.7': '#1f5a73', line: '#1f5a73', 'primary.2': '#0a1c24' }
    }
  ],
  subgrids: [
    {
      id: 'pages',
      grid: { columns: 4, rows: 1 },
      place: { area: { column: 1, row: 5, columnSpan: 4, rowSpan: 1 }, grid: { columns: 4, rows: 5 } },
      areas: {
        'show-flight': { column: 1, row: 1, columnSpan: 1, rowSpan: 1 },
        'show-shields': { column: 2, row: 1, columnSpan: 1, rowSpan: 1 }
      },
      widgets: [
        { id: 'show-flight', type: 'label', options: { label: 'Flight' }, action: { page: 'flight' } },
        { id: 'show-shields', type: 'label', options: { label: 'Shields' }, action: { page: 'shields' } }
      ]
    }
  ]
};

export const starterDocuments: MfdDocument[] = [
  {
    ...demo,
    pages: demo.pages.map(page => ({
      ...page,
      layouts: page.layouts.map(layout => scaleLayout(layout, seedGrid(DEFAULT_SHAPE)))
    }))
  }
];
