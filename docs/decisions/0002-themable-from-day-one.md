# 0002: Deep theming and customisation from day one

- **Status:** Accepted
- **Date:** 2026-11-24

## Decision

Theming and customisation are a **core feature, built in from the start**, not added later. MFDIY must support people integrating their MFD into a physical sim pit, where the display has to look like it belongs to the cockpit around it.

## Why

This is the main way MFDIY stands apart. Once the game's telemetry became public, many similar MFD projects were bound to appear. Most will offer a handful of widgets on a fixed look. MFDIY's edge is that the result can match _your_ cockpit.

Adding theming later is expensive: every widget built before it would need reworking. Building every widget against theme tokens from the first commit avoids that.

## Consequences

- **Widgets never hard-code visual values.** Every colour, font, size, border, radius, glow and spacing comes from theme tokens (CSS custom properties), so a theme can restyle every widget without touching widget code.
- **Themes are data, not code**: a serialisable format (e.g. JSON) that can be saved, exported, imported and shared.
- **Customise at several levels**: global theme → per-screen → per-widget overrides.
- **Sim-pit features to plan for:**
  - Custom fonts (including user-supplied), backgrounds and colour palettes.
  - **Physical bezel alignment**: put on-screen button labels exactly next to the buttons of a physical MFD bezel (e.g. bezels that clip around a screen), with adjustable offsets.
  - Calibration of safe areas, margins and screen insets for screens mounted behind a frame.
  - Night or low-brightness modes for dark sim rooms.
- Ship a few distinctive built-in themes so the customisation is visible on first launch.

## Open questions

- **Raw custom CSS?** Allowing it gives power users full control, but shared themes would then contain arbitrary CSS. Decide whether to allow it, scope it (e.g. Shadow DOM or `@scope`), or restrict themes to tokens only.
- How do user-supplied assets (fonts, images) get stored and shared alongside a theme?
- Should a theme include layout-level choices such as widget chrome and frame style, or only visual tokens?
