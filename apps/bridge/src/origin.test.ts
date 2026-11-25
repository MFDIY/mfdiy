import { expect, it } from 'vitest';

import { isAllowedOrigin } from './origin.js';

it.each([
  ['localhost:4000', 'http://localhost:4000'],
  ['192.168.1.20:8420', 'http://192.168.1.20:8420'],
  ['192.168.1.20', 'http://192.168.1.20'],
  ['[fe80::1]:8420', 'http://[fe80::1]:8420'],
  ['mfdiy.local', 'http://mfdiy.local'],
  ['gaming-pc:8420', 'http://gaming-pc:8420'],
  ['gaming-pc.lan', 'http://gaming-pc.lan']
])('allows the app served from %s', (host, origin) => {
  expect(isAllowedOrigin({ host, origin })).toBe(true);
});

it('allows programs that send no origin', () => {
  expect(isAllowedOrigin({ host: 'localhost:8420' })).toBe(true);
});

it.each([
  ['another website', 'localhost:8420', 'https://example.com'],
  ['another port on this PC', 'localhost:8420', 'http://localhost:3000'],
  ['a website pointing its own name here', 'example.com', 'http://example.com'],
  ['a sandboxed or local page', 'localhost:8420', 'null'],
  ['a missing host', undefined, 'http://localhost:8420']
])('refuses %s', (_, host, origin) => {
  expect(isAllowedOrigin({ host, origin })).toBe(false);
});
