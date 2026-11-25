# 0014: Creator subscription

- **Status:** Accepted
- **Date:** 2026-11-25

## Decision

A **Creator** subscription for streamers and video creators, following 0013 (they earn money with MFDIY, so MFDIY earns from them). Its features live in a separately licensed add-on, outside the MIT core.

### Included

1. **Stream overlays.** Live ship telemetry as OBS browser sources, styled with MFDIY themes. Free users can use overlays with a small MFDIY mark; the subscription removes it and adds the creator's own branding.
2. **Automatic stream markers and clips.** Game events (e.g. seat changes, being downed, deaths) create Twitch / YouTube stream markers or trigger clips, saving creators editing time.
3. **Flight recorder and replay overlays.** Record a session's telemetry and render synced overlays onto edited videos afterwards.

### Maybe

4. **Viewer page.** A public link where viewers watch the creator's MFD live. Needs a server relay (running cost). Viewers can only watch, never trigger anything.
5. **Chat integration.** Chat messages, subs and channel-point redemptions can drive overlay effects **and game actions**. MFDIY stays unopinionated: it doesn't block any action, but **clearly warns** when a creator connects chat to an action, especially destructive ones (e.g. self-destruct). This is a distinctive selling point.

## Why

- Creators turn MFDIY into content and income; a recurring payment matches that ongoing value.
- Overlays, markers and replay overlays are the most demand for the least infrastructure: they run locally and need no servers.

## Consequences

- Needs integrations with streaming platforms (Twitch, YouTube) and OBS.
- The flight recorder needs telemetry storage and a timeline format, which the core could also use (e.g. sparklines).
- Chat-triggered actions still go through the bridge's action allowlist and rate limiting.
- The viewer page is the first feature with server costs; build it only once the subscription has subscribers.
