# MFDIY

**Build your MFD. No code required.**

MFDIY is a no-code builder for custom multi-function displays (MFDs). Drag gauges, status lights and buttons onto a canvas, bind them to live game telemetry, and open the result in any browser: a phone, a tablet, or a Raspberry Pi with a touchscreen next to your HOTAS.

Buttons on the display can trigger in-game actions and are labelled on screen, so you stop memorising key layouts.

> 🚧 **Early days.** This package is a placeholder while the project takes shape. Nothing to install yet.

## How it will work

```
Game (local gRPC telemetry) ──▶ MFDIY bridge (your PC) ──WebSocket──▶ MFD in your browser
```

- **Bridge**: a small app on your gaming PC that reads the game's local telemetry stream and serves it to devices on your home network.
- **Builder**: a drag-and-drop editor for laying out screens, widgets and actions.
- **Display**: a full-screen, touch-friendly page that renders your layout from live data.

## Status

- [ ] Telemetry bridge
- [ ] Widget library (gauges, bars, annunciator lights, toggles, buttons)
- [ ] Layout builder
- [ ] Shareable layout presets

## Disclaimer

MFDIY is an unofficial fan project and is not affiliated with or endorsed by any game developer or publisher. Game telemetry interfaces may be undocumented and can change between game patches.

## License

[MIT](LICENSE)
