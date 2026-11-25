import type { MfdDocument } from './document.js';
import type { ActionDefinition, GameInfo, SignalDefinition } from './signals.js';

/**
 * What a game adapter provides. Adapters map one game's telemetry to MFDIY's game-agnostic signals
 * and actions, so everything downstream of the bridge stays game-agnostic.
 *
 * Connecting to the game (e.g. Star Citizen's gRPC stream) is the bridge's job; the adapter only
 * describes the game and translates between its data and MFDIY's.
 */
export type GameAdapter = {
  game: GameInfo;
  signals: SignalDefinition[];
  actions: ActionDefinition[];
  /** What a new library starts with, so there is something to look at and edit. */
  starterDocuments: MfdDocument[];
};
