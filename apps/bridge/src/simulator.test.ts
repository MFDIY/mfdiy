import type { GameAdapter } from '@mfdiy/schema';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSimulator } from './simulator.js';

const adapter: GameAdapter = {
  game: { id: 'test', name: 'Test' },
  signals: [
    { id: 'fuel', label: 'Fuel', group: 'Fuel', kind: 'number', min: 0, max: 100 },
    { id: 'vehicle.gear-down', label: 'Gear', group: 'Vehicle', kind: 'boolean' }
  ],
  actions: [{ id: 'vehicle.gear-toggle', label: 'Gear', group: 'Vehicle', holdable: false }],
  starterDocuments: []
};

describe('createSimulator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps numbers within their range', () => {
    vi.useFakeTimers();
    const simulator = createSimulator(adapter);

    vi.advanceTimersByTime(10_000);

    const fuel = simulator.snapshot()['fuel'];
    expect(typeof fuel).toBe('number');
    expect(fuel).toBeGreaterThanOrEqual(0);
    expect(fuel).toBeLessThanOrEqual(100);
    simulator.stop();
  });

  it('flips the matching boolean signal for a toggle action', async () => {
    const simulator = createSimulator(adapter, { random: () => 0.9 });
    const before = simulator.snapshot()['vehicle.gear-down'];

    await expect(simulator.triggerAction('vehicle.gear-toggle', undefined)).resolves.toBe('ok');
    expect(simulator.snapshot()['vehicle.gear-down']).toBe(!before);
    simulator.stop();
  });

  it('rejects actions the adapter does not declare', async () => {
    const simulator = createSimulator(adapter);

    await expect(simulator.triggerAction('self-destruct', undefined)).resolves.toBe('unknown-action');
    simulator.stop();
  });
});
