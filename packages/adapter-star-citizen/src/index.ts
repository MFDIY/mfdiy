import {
  withDefaultThresholds,
  type ActionDefinition,
  type GameAdapter,
  type SignalDefinition,
  type Thresholds
} from '@mfdiy/schema';

import { starterDocuments } from './starterDocuments.js';

/*
 * First draft of the Star Citizen signal catalogue, based on what the community has documented about
 * the 5.0 telemetry stream (shields, hull, fuel, flight instruments, IFCS state, annunciators).
 *
 * Not yet done:
 * - Mapping TelemetryStream frames to these signals. Field names come from the game's protobuf schema,
 *   which is undocumented and changes between patches; read it from a live frame first.
 * - Mapping these actions to the game's TriggerGameAction names (see ListTriggerableActions).
 */

/** Drafts until real frames show what players need; users change them per widget (0023). */
const runningLow: Thresholds = { low: { warning: 25, critical: 10 } };

const percent = (id: string, label: string, group: string, thresholds?: Thresholds): SignalDefinition => ({
  id,
  label,
  group,
  kind: 'number',
  min: 0,
  max: 100,
  unit: '%',
  ...(thresholds ? { thresholds } : {})
});

const flag = (id: string, label: string, group: string): SignalDefinition => ({
  id,
  label,
  group,
  kind: 'boolean'
});

const signals: SignalDefinition[] = [
  percent('hull', 'Hull', 'Vehicle', runningLow),
  percent('shields.front', 'Shield front', 'Shields', runningLow),
  percent('shields.rear', 'Shield rear', 'Shields', runningLow),
  percent('shields.left', 'Shield left', 'Shields', runningLow),
  percent('shields.right', 'Shield right', 'Shields', runningLow),
  percent('fuel.hydrogen', 'Hydrogen fuel', 'Fuel', runningLow),
  percent('fuel.quantum', 'Quantum fuel', 'Fuel', runningLow),
  { id: 'flight.speed', label: 'Speed', group: 'Flight', kind: 'number', min: 0, max: 1400, unit: 'm/s' },
  { id: 'flight.altitude', label: 'Altitude', group: 'Flight', kind: 'number', min: 0, max: 100_000, unit: 'm' },
  {
    id: 'flight.g-force',
    label: 'G-force',
    group: 'Flight',
    kind: 'number',
    min: -10,
    max: 15,
    unit: 'g',
    thresholds: { high: { warning: 7, critical: 9 }, low: { warning: -3, critical: -5 } }
  },
  percent('flight.boost', 'Boost', 'Flight'),
  {
    id: 'flight.master-mode',
    label: 'Master mode',
    group: 'Flight',
    kind: 'enum',
    options: [
      { value: 'scm', label: 'SCM' },
      { value: 'nav', label: 'NAV' }
    ]
  },
  flag('ifcs.decoupled', 'Decoupled', 'Flight assist'),
  flag('ifcs.esp', 'ESP', 'Flight assist'),
  flag('ifcs.g-safe', 'G-safe', 'Flight assist'),
  flag('ifcs.cruise', 'Cruise control', 'Flight assist'),
  flag('vehicle.gear-down', 'Landing gear down', 'Vehicle'),
  flag('vehicle.lights', 'Lights', 'Vehicle'),
  flag('vehicle.doors-open', 'Doors open', 'Vehicle'),
  flag('vehicle.power', 'Power', 'Vehicle'),
  percent('player.health', 'Health', 'Player', runningLow),
  percent('player.oxygen', 'Oxygen', 'Player', runningLow),
  { id: 'player.balance', label: 'aUEC balance', group: 'Player', kind: 'number', min: 0, max: 1_000_000_000 }
];

const action = (id: string, label: string, group: string, holdable = false): ActionDefinition => ({
  id,
  label,
  group,
  holdable
});

const actions: ActionDefinition[] = [
  action('vehicle.gear-toggle', 'Landing gear', 'Vehicle'),
  action('vehicle.lights-toggle', 'Lights', 'Vehicle'),
  action('vehicle.doors-toggle', 'Doors', 'Vehicle'),
  action('vehicle.power-toggle', 'Power', 'Vehicle'),
  action('ifcs.decouple-toggle', 'Decouple', 'Flight assist'),
  action('ifcs.esp-toggle', 'ESP', 'Flight assist'),
  action('ifcs.g-safe-toggle', 'G-safe', 'Flight assist'),
  action('ifcs.cruise-toggle', 'Cruise control', 'Flight assist'),
  action('flight.master-mode-cycle', 'Master mode', 'Flight')
];

export const starCitizen: GameAdapter = {
  game: { id: 'star-citizen', name: 'Star Citizen' },
  signals,
  actions,
  starterDocuments: starterDocuments.map(document => withDefaultThresholds(document, signals))
};
