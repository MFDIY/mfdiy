import type { ActionStatus, BridgeSource, GameAdapter, SignalValues } from '@mfdiy/schema';

/**
 * Where telemetry comes from: the real game, or the simulator. The hub only talks to this interface,
 * so the rest of the bridge doesn't care which one is running.
 */
export type TelemetrySource = {
  kind: BridgeSource;
  adapter: GameAdapter;
  /** Current value of every signal. */
  snapshot(): SignalValues;
  /** Called whenever one or more signals change. Returns an unsubscribe function. */
  subscribe(listener: (changed: SignalValues) => void): () => void;
  triggerAction(action: string, holdMs: number | undefined): Promise<ActionStatus>;
  stop(): void;
};
