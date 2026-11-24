import { starCitizen } from '@mfdiy/adapter-star-citizen';
import { existsSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import sirv from 'sirv';
import { WebSocketServer } from 'ws';

import { createHub } from './hub.js';
import { createSimulator } from './simulator.js';

const DEFAULT_PORTS = [80, 8420];

const { values: args } = parseArgs({
  options: {
    port: { type: 'string' },
    'no-static': { type: 'boolean', default: false },
    static: { type: 'string', default: fileURLToPath(new URL('../../app/build/client', import.meta.url)) }
  }
});

// Only the simulator exists so far. Connecting to the game's gRPC stream is the next step.
const source = createSimulator(starCitizen);
const hub = createHub(source);

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

const sockets = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 });

server.on('upgrade', (request, socket, head) => {
  if (new URL(request.url ?? '/', 'http://localhost').pathname !== '/ws') {
    socket.destroy();

    return;
  }

  sockets.handleUpgrade(request, socket, head, client => hub.connect(client));
});

const ports = args.port ? [Number(args.port)] : DEFAULT_PORTS;

function listen(server: Server, [port, ...fallbacks]: number[]): Promise<number> {
  return new Promise((resolve, reject) => {
    if (port === undefined) {
      reject(new Error('No port available.'));

      return;
    }

    server.once('error', (error: NodeJS.ErrnoException) => {
      if ((error.code === 'EADDRINUSE' || error.code === 'EACCES') && fallbacks.length > 0) {
        resolve(listen(server, fallbacks));
      } else {
        reject(error);
      }
    });

    server.listen(port, () => resolve(port));
  });
}

const port = await listen(server, ports);
const suffix = port === 80 ? '' : `:${port}`;

const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter(address => address && address.family === 'IPv4' && !address.internal)
  .map(address => `http://${address?.address}${suffix}`);

console.log(`MFDIY bridge (${source.adapter.game.name}, ${source.kind})`);
console.log(serveApp ? `Open the MFD on any device on your network:` : 'Telemetry WebSocket available at /ws on:');
for (const address of [`http://localhost${suffix}`, ...lanAddresses]) {
  console.log(`  ${address}`);
}

function shutdown() {
  hub.stop();
  source.stop();
  server.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
