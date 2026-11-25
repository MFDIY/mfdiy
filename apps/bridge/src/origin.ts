import type { IncomingHttpHeaders } from 'node:http';

import { isIP } from 'node:net';

/** Endings that only exist on local networks, so no website can have them. */
const LOCAL_SUFFIXES = ['.local', '.lan', '.home.arpa', '.internal', '.localhost'];

/**
 * Whether a WebSocket may connect. Browsers let any website open a WebSocket to any address, so
 * without this check a page the player happens to visit could press buttons in the game or delete
 * saved documents.
 *
 * - The page must come from the address it connects to, i.e. be the app served by this bridge.
 * - That address must be a local one, or a website could point its own domain name at the bridge
 *   (DNS rebinding).
 *
 * Programs that aren't browsers send no `Origin`, and nothing here stops them.
 */
export function isAllowedOrigin({ host, origin }: IncomingHttpHeaders): boolean {
  if (origin === undefined) {
    return true;
  }

  // The URL parser also normalises, e.g. dropping a default port on either side.
  const page = parse(origin);
  const target = parse(`http://${host ?? ''}`);

  if (!page || !target || page.protocol !== 'http:' || page.host !== target.host) {
    return false;
  }

  const name = target.hostname.replace(/^\[|\]$/g, '');

  return isIP(name) !== 0 || !name.includes('.') || LOCAL_SUFFIXES.some(suffix => name.endsWith(suffix));
}

function parse(url: string): URL | undefined {
  return URL.canParse(url) ? new URL(url) : undefined;
}
