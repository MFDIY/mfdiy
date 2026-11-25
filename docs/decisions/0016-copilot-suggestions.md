# 0016: Co-pilot suggestions powered by Jev

- **Status:** Accepted
- **Date:** 2026-11-25

## Context

Players struggle to memorise which control does what. Jev (TypeSafe AI, released September 2026) is a hosted classification model: given text and a set of candidate answers, it picks one with a confidence score instead of generating text. Input costs $42 per billion tokens and output is free, so a ~300-token call costs about $0.0000126 (roughly 80,000 calls per dollar).

## Decision

### A co-pilot that suggests actions

- A **suggested-actions widget** shows one to three action buttons that fit the current situation. **The player always presses them**; the co-pilot never triggers actions itself.
- **Plain-text configuration.** Players describe when they want suggestions in their own words, e.g. "when I'm in a dogfight and my front shield is failing, suggest rebalancing". No rules or logic to write.
- **Candidates are the allowlisted actions** the bridge offers right now, plus "nothing". Jev picks from that list, so it can't suggest an action that doesn't exist or isn't available.
- Suggestions only appear above a **confidence threshold**.
- The co-pilot is queried on **meaningful context changes** (debounced, at most about once a second), never per telemetry frame. Cloud latency of a few hundred milliseconds is acceptable for suggestions a human then acts on.
- Input is a **compact text snapshot** of relevant signals and recent events, around 300 tokens.

### Paid, with Jev kept internal

- The co-pilot is part of a **paid subscription**. It has running costs, so it falls under "paid to host" in 0013. Which plan it belongs to is decided when plans are packaged.
- **Jev stays internal: no bring-your-own API key.** Bridges call an MFDIY service, which holds the Jev credentials and calls Jev. The key never ships in the bridge or the app.

### Privacy

- The co-pilot is **opt-in**. Game data only leaves the PC when it is enabled.
- Players can **see exactly what is sent**.

### Out of scope

**Acting on the player's behalf** (auto-actions) is not part of this decision. It would need a separate decision, a check that the game's terms allow automated actions, and strict safeguards (per-action opt-in, never destructive actions, high confidence thresholds, a visible log and a kill switch).

## Why

- It attacks the original problem directly: instead of memorising layouts, the right button appears at the right moment.
- Choice-based classification fits the problem exactly and can't invent actions.
- Plain-text configuration keeps the feature true to MFDIY's no-code promise.
- Keeping Jev internal gives a simpler experience (no developer account or key to manage), protects the credentials and lets MFDIY control usage and cost.

## Consequences

- First server-side component that every co-pilot user depends on: an **MFDIY service** that authenticates subscribers, applies per-user usage limits and proxies requests to Jev. It can share infrastructure with the relay from 0015.
- **Accounts and billing** are needed for subscribers.
- The service must not log or retain game data beyond what is needed to answer a request.
- The model sits behind an interface in the service, so it can be replaced if Jev changes or disappears.
- Real-world latency and pricing must be measured before launch; the figures above come from launch coverage and the maintainer's own numbers.
