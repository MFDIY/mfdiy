# Star Citizen telemetry: what we know

Collected from community sources in November 2026. **Nothing here has been verified against a live game yet.** The API is undocumented and reverse-engineered by the community; expect details to change between patches. Update this file as soon as real frames have been captured.

**Status, 27 November 2026:** the game developer removed the gRPC telemetry feed in a recent patch. The community expects it to return; until it does, MFDIY runs on the simulator only, and the beta waits (0020).

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

## Schema and mapping

The schema doesn't have to wait for a captured frame: the game contains its protobuf descriptors, and community tools extract them. Compared on 2026-11-25 against the `.proto` files published by magmahindenburg for PTU `5.0.202.205`:

- **Every signal in `packages/adapter-star-citizen` has a counterpart**, vehicle, flight and player alike.
- **Values that differ from our catalogue:** fuel, boost, shields and hull are 0–1, not 0–100 (ranges come from that author's comments, not the game, so **unverified**); health and oxygen are a `Gauge` (`current`, `max`); flight-assist settings are an `Availability` (`enabled`, `active`), and the game reports _coupled_ where we have _decoupled_; gear is a deployment state (retracted, deploying, deployed, retracting), not a flag; doors have an open state and a lock state; power is one flag per system.
- **Master mode has a third value, `STEALTH`**, which our catalogue lacks.
- **Useful signals we lack:** ten annunciators (`pwr`, `wpn`, `thr`, `shld`, `cool`, `qdrv`, `radr`, `prox`, `hit`, `misl`; nominal, off, or minor / major, flashing / on), countermeasures (decoy, noise), heading, vertical speed, radar altitude, power per system, landed, and ship name, class and manufacturer (the latter for 0012).
- Shield faces are an unnamed list; the order isn't in the schema.
- **Versions:** LIVE 4.10.3 is reported as display only, with fewer fields (no shields or hull); actions need 5.0. On 2026-11-25, 5.0 was on PTU with no confirmed LIVE date.

**Generate the schema from the installed game**, for PTU and LIVE separately and again after each patch. [sc_make_proto](https://github.com/Purzifal/sc_make_proto) does it with one command; it reports having tested both versions. It's GPL-3.0 and magmahindenburg's repository shows no licence, so **use them as references and don't copy their code or files into the MIT core**.

## Unknowns to settle with a real frame

- The order of the shield faces, real units and ranges, and which fields LIVE actually sends.
- Whether names come through as display names or internal codes, and how manufacturers are spelled.
- Which game action names, from `ListTriggerableActions`, map to the actions in `packages/adapter-star-citizen`. The list was reported as about 106 actions, later 112; weapons and targeting are excluded.

## Sources

- [magmahindenburg/StarCitizenTelemetry](https://github.com/magmahindenburg/StarCitizenTelemetry): protocol notes and `.proto` files (`proto/sc/game/telemetry/v1/types.proto`, `api.proto`, plus raw descriptor dumps).
- [crypticsh/sctelemetry](https://github.com/crypticsh/sctelemetry): browser-based MFD with a flight recorder.
- [Sokren/sc-telemetry-deck](https://github.com/Sokren/sc-telemetry-deck): Stream Deck plugin and web app; documents the LIVE and PTU enable steps.
- [scpages/telemetry](https://github.com/scpages/telemetry): web app; documents the `user.cfg` lines.
- [Purzifal/sc_make_proto](https://github.com/Purzifal/sc_make_proto): extracts the `.proto` file from the installed game (GPL-3.0).
