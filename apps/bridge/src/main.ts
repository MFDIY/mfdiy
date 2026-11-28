import { starCitizen } from '@mfdiy/adapter-star-citizen';
import { existsSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { networkInterfaces } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import QRCode from 'qrcode';
import sirv from 'sirv';
import { WebSocketServer } from 'ws';

import { lanAddresses } from './addresses.js';
import { createHub } from './hub.js';
import { defaultDataDirectory, openLibrary } from './library.js';
import { isAllowedOrigin } from './origin.js';
import { createSimulator } from './simulator.js';

const DEFAULT_PORTS = [80, 8420];

/** Room for a very large document; anything bigger closes the connection. */
const MAX_MESSAGE_BYTES = 1024 * 1024;

const { values: args } = parseArgs({
  options: {
    data: { type: 'string' },
    port: { type: 'string' },
    'no-static': { type: 'boolean', default: false },
    static: { type: 'string', default: fileURLToPath(new URL('../../app/build/client', import.meta.url)) }
  }
});

// Only the simulator exists so far. Connecting to the game's gRPC stream is the next step.
const source = createSimulator(starCitizen);
const dataDirectory = args.data ? resolve(args.data) : defaultDataDirectory();
const library = await openLibrary(dataDirectory, source.adapter.starterDocuments);
let port = 0;
const hub = createHub(source, library, () => lanAddresses(networkInterfaces(), port));

const serveApp =
  !args['no-static'] && existsSync(args.static) ? sirv(args.static, { single: true, etag: true }) : undefined;

const server = createServer((request, response) => {
  if (serveApp) {
    serveApp(request, response);

    return;
  }

  response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  response.end('MFDIY bridge is running. The app is not built yet: run `npm run build` in the repository root.\n');
});

const sockets = new WebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE_BYTES });

server.on('upgrade', (request, socket, head) => {
  if (new URL(request.url ?? '/', 'http://localhost').pathname !== '/ws' || !isAllowedOrigin(request.headers)) {
    socket.destroy();

    return;
  }

  sockets.handleUpgrade(request, socket, head, client => hub.connect(client));
});

const ports = args.port ? [Number(args.port)] : DEFAULT_PORTS;

function listen(server: Server, [port, ...fallbacks]: number[]): Promise<number> {
  return new Promise((settle, reject) => {
    if (port === undefined) {
      reject(new Error('No port available.'));

      return;
    }

    server.once('error', (error: NodeJS.ErrnoException) => {
      if ((error.code === 'EADDRINUSE' || error.code === 'EACCES') && fallbacks.length > 0) {
        settle(listen(server, fallbacks));
      } else {
        reject(error);
      }
    });

    server.listen(port, () => settle(port));
  });
}

port = await listen(server, ports);
const local = `http://localhost${port === 80 ? '' : `:${port}`}`;
const addresses = lanAddresses(networkInterfaces(), port);

console.log(`MFDIY bridge, ${source.kind === 'simulator' ? 'simulating' : 'connected to'} ${source.adapter.game.name}`);

if (serveApp) {
  const [first] = addresses;

  if (first) {
    console.log('Scan this with a phone or tablet on the same network to open your profiles:');
    console.log(await QRCode.toString(first, { type: 'terminal', small: true }));
  }

  console.log(addresses.length > 0 ? 'Or open one of these on any device on your network:' : 'Open:');
  for (const address of [...addresses, local]) {
    console.log(`  ${address}`);
  }

  console.log(`To connect another device, open ${local}/connect on this PC.`);
} else {
  console.log('Telemetry WebSocket available at /ws on:');
  for (const address of [local, ...addresses]) {
    console.log(`  ${address}`);
  }
}

console.log(`Profiles are saved in ${dataDirectory}`);

function shutdown() {
  hub.stop();
  source.stop();
  server.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
