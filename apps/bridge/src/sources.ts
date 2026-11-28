import type { TelemetrySource } from './source.js';
import type { BridgeSource, GameAdapter } from '@mfdiy/schema';

import { createSimulator } from './simulator.js';

/** What the bridge starts on when nothing is chosen: the simulator, while it's the only source. */
export const DEFAULT_SOURCE: BridgeSource = 'simulator';

/**
 * Starts the chosen telemetry source, or returns why it can't. The launcher in the Windows
 * download (0020) passes no `--source`, so the default can move to the game once its connection
 * exists, without a new launcher.
 */
export function createSource(
  kind: BridgeSource,
  adapter: GameAdapter
): { source: TelemetrySource } | { unavailable: string } {
  switch (kind) {
    case 'simulator':
      return { source: createSimulator(adapter) };
    case 'game':
      return {
        unavailable: `The connection to ${adapter.game.name} isn't built yet. Start without --source to simulate it.`
      };
  }
}
