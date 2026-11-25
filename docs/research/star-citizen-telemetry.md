# Star Citizen telemetry: what we know

Collected from community sources in November 2026. **Nothing here has been verified against a live game yet.** The API is undocumented and reverse-engineered by the community; expect details to change between patches. Update this file as soon as real frames have been captured.

## Enabling it

The game runs a local gRPC server when enabled. Commands as reported by community tools:

- **5.0 PTU:** lines in `StarCitizen\<channel>\user.cfg` (the game install folder, not the launcher):
  ```
  grpc.client.server.enabled = 1
  grpc.client.server.port = 2942
  server.game.telemetry.enabled = 1
  server.game.telemetry.trigger.actions.enabled = 1
  ```
  - `server.game.telemetry.test.data = 1` makes the game send fake data (useful for testing without flying).
  - `grpc-client-server-external` (exact syntax unverified) binds to `0.0.0.0` instead of `127.0.0.1`. MFDIY doesn't need it: the bridge runs on the same PC.
- **4.10.3 LIVE:** an environment variable, `setx GRPC_CLIENT_SERVER_ENABLED true`, then fully close the game and the RSI Launcher.

## Transport

- Plaintext gRPC over HTTP/2 (h2c), default port **2942** (some tools configure 50051), bound to `127.0.0.1` by default.
- About **20 Hz**. A standard gRPC health-check service is available.
- **No authentication.** Anything that can reach the port can read data and trigger actions.
- No server reflection: the `.proto` schema must come from elsewhere.

## Service

`sc.game.telemetry.v1.GameTelemetryService`:

- `TelemetryStream(TelemetryStreamRequest) returns (stream TelemetryStreamResponse)`: server-streaming, empty request.
- `TriggerGameAction(TriggerGameActionRequest) returns (TriggerGameActionResponse)`: request `{ action_name, optional hold_ms }`. Statuses: `OK`, `UNKNOWN_ACTION`, `MAP_INACTIVE` (wrong context, e.g. not flying), `RATE_LIMITED`, `FAILED`, `HOLD_NOT_ALLOWED`, `FILTERED`.
- `ListTriggerableActions`: lists the allowlisted actions (about 106: emotes, power toggles, doors, flight-assist toggles, master mode and more). **Weapons are excluded.**

## Data reported in the stream

- **Vehicle:** name, class, manufacturer, type; hull; lights; doors; flight instruments (speed, altitude, G-meter, boost); flight-assist (IFCS) settings. The vehicle frame is present only when seated in or flying a vehicle.
- **Power and warnings:** a caution/warning annunciator panel, a powerplant bitfield, master mode.
- **Shields:** overall and per face.
- **Fuel:** hydrogen and quantum.
- **Player:** vitals (health, oxygen, heart rate and more), aUEC balance.
- **Actor state:** locomotion `ON_FOOT` / `EVA` / `SEATED`; crew role `PILOT` / `GUNNER` / `CREW`; seat name (e.g. `pilot_seat`, `turret_top`, `copilot_seat`).
- **Events:** `ENTER_SEAT`, `LEAVE_SEAT`, `ACTOR_SPAWN`, `DEAD`, `RESPAWN`, `DOWNED`.
- Weapons status and force-feedback data.
- **Not available:** power pip allocation and IR / EM / cross-section signatures.

## Unknowns to settle with a real frame

- Exact protobuf field names, and whether vehicles come through as display names or internal codes (e.g. `AEGS_Gladius`).
- How manufacturers are spelled.
- Which game action names map to the actions in `packages/adapter-star-citizen`.

## Sources

- [magmahindenburg/StarCitizenTelemetry](https://github.com/magmahindenburg/StarCitizenTelemetry): protocol notes and `.proto` files (`proto/sc/game/telemetry/v1/types.proto`, `api.proto`, plus raw descriptor dumps).
- [crypticsh/sctelemetry](https://github.com/crypticsh/sctelemetry): browser-based MFD with a flight recorder.
- [Sokren/sc-telemetry-deck](https://github.com/Sokren/sc-telemetry-deck): Stream Deck plugin and web app; documents the LIVE and PTU enable steps.
- [scpages/telemetry](https://github.com/scpages/telemetry): web app; documents the `user.cfg` lines.
