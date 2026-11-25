# MFDIY

**Build your MFD. No code required.** · [mfdiy.app](https://mfdiy.app)

MFDIY is a no-code builder for custom multi-function displays (MFDs). Drag gauges, status lights and buttons onto a canvas, bind them to live game telemetry, and open the result in any browser: a phone, a tablet, or a Raspberry Pi with a touchscreen next to your HOTAS.

Buttons on the display can trigger in-game actions and are labelled on screen, so you stop memorising key layouts.

> 🚧 **Early days.** The project is taking shape. Nothing to install yet. Packages will be published under the [`@mfdiy`](https://www.npmjs.com/org/mfdiy) scope.

## How it works

```
Game (local gRPC telemetry) ──▶ MFDIY bridge (your PC) ──WebSocket──▶ MFD in your browser
```

- **Bridge**: a small app on your gaming PC that reads the game's local telemetry stream and serves it to devices on your home network.
- **Builder**: a drag-and-drop editor for laying out screens, widgets and actions.
- **Display**: a full-screen, touch-friendly page that renders your layout from live data.

## Development

Requires Node 24.

```sh
npm install
npm run dev     # bridge simulator + app on http://localhost:4000 (open /display)
```

To try it on a phone or tablet, build the app and let the bridge serve it on your network:

```sh
npm run build
npm start       # prints the addresses to open on other devices
```

The bridge currently runs a **simulator** that generates plausible telemetry; connecting to the game itself is next. See [`CLAUDE.md`](CLAUDE.md) for the repository layout and [`docs/decisions/`](docs/decisions/) for design decisions.

## Status

- [x] Monorepo scaffold, schemas, theme contract
- [x] Bridge with telemetry simulator
- [x] Display rendering a demo layout, with per-page theming and actions
- [ ] Connect the bridge to the game's telemetry
- [x] Saving profiles on the bridge, shared by every device
- [ ] Builder
- [ ] Tap-to-engage, keep-awake, `mfdiy.local` and QR code (decisions 0004, 0005)
- [ ] Shareable layouts and themes

## Disclaimer

MFDIY is an unofficial fan project and is not affiliated with or endorsed by any game developer or publisher. Game telemetry interfaces may be undocumented and can change between game patches.

## License

[MIT](LICENSE)
