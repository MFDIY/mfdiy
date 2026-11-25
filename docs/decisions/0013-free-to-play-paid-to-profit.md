# 0013: Free to play, paid to profit or to host

- **Status:** Accepted
- **Date:** 2026-11-25

## Context

Money for MFDIY is meant to **cover costs** and to provide **external motivation** when internal motivation dips, not to be a main income. One-off purchases were considered and rejected: as features keep landing, early adopters would pay a lot for a lean product and late adopters little for a full one, and splitting new features into extra purchases feels exploitative.

## Decision

### The principle

**MFDIY is free for anyone who plays. People pay when they earn money with it, or when a feature costs money to run.**

- **Player functionality is never paywalled**: the bridge, builder, display, theming, automation and multiple displays are free.
- **Paid offerings** are limited to (a) features for people who profit from MFDIY (creators, event organisers, businesses; see 0014 and 0015) and (b) features that need servers and so have running costs.

### Open source core

- The core (everything in this repository today) is **open source under MIT**, in a **public repository**.
- Open source keeps costs near zero: free code signing through the SignPath Foundation (requires an OSI licence, a public repository and automated builds; see 0003) and free GitHub Pages hosting for public repositories.
- MIT means anyone may fork and reuse the core, competitors included. MFDIY's advantage is being the original, best-maintained project.

### Paid add-ons are separately licensed

- Paid features that run **locally** live in **separate add-on packages outside the MIT core**, under a closed or source-available licence (to be chosen when the first add-on is built). MIT code can't enforce a paywall.
- Paid features that run on **MFDIY's servers** are gated by the service itself.
- Code already released under MIT stays MIT; paid features are always new, separate code.

### Support

- **Sponsorship and donations** (GitHub Sponsors, Ko-fi or similar) for players who want to support the project.
- Supporter perks are **cosmetic or community only**: a supporter badge or credit, supporter themes, a Discord role, a say in the roadmap. They never take anything away from non-supporters.

### Not monetised

- **The secure link** (per-bridge HTTPS subdomain, 0004): telemetry would stay on the LAN with no added latency, but it only adds polish (installable app, native Wake Lock, service worker). Not worth a subscription; may be offered free later if HTTPS-only features become essential.
- **A theme and layout gallery**: valuable for community and growth, not as a paid product. If built, it's free.

## Why

- Charging those who profit, or for real running costs, feels fair; charging players for features doesn't.
- Recurring payments from creators and organisers are sustainable and match ongoing value: as long as they're creating and earning, MFDIY earns too.
- Open source maximises trust (the bridge runs on players' PCs and opens a network port), invites crowd-sourced game adapters, and removes the biggest fixed cost (code signing).

## Consequences

- The repository must be **made public** before the first release (needed for SignPath and free Pages).
- The repository layout must keep paid add-ons separate from the MIT core, with clear licence boundaries; the core must expose extension points the add-ons can use.
- Before charging for anything, check the game developer's terms and fan-content rules for commercial tools.
- Revisit if running costs grow beyond what sponsorship and paid offerings cover.
