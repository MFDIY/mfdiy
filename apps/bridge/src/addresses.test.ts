import type { NetworkInterfaceInfo } from 'node:os';

import { expect, it } from 'vitest';

import { lanAddresses } from './addresses.js';

function ipv4(address: string, internal = false): NetworkInterfaceInfo {
  return { address, family: 'IPv4', internal, mac: '00:00:00:00:00:00', netmask: '255.255.255.0', cidr: null };
}

it('puts the home network first and virtual adapters last', () => {
  const interfaces = {
    'vEthernet (WSL)': [ipv4('172.20.0.1')],
    Ethernet: [ipv4('10.0.0.5')],
    'Wi-Fi': [ipv4('192.168.1.20')],
    'VirtualBox Host-Only Network': [ipv4('192.168.56.1')]
  };

  expect(lanAddresses(interfaces, 80)).toEqual([
    'http://192.168.1.20',
    'http://10.0.0.5',
    'http://192.168.56.1',
    'http://172.20.0.1'
  ]);
});

it('leaves out addresses no other device can use', () => {
  const interfaces = {
    lo: [ipv4('127.0.0.1', true)],
    Ethernet: [ipv4('169.254.10.2'), { ...ipv4('fe80::1'), family: 'IPv6' as const, scopeid: 1 }]
  };

  expect(lanAddresses(interfaces, 80)).toEqual([]);
});

it('adds the port when it is not 80', () => {
  expect(lanAddresses({ 'Wi-Fi': [ipv4('192.168.1.20')] }, 8420)).toEqual(['http://192.168.1.20:8420']);
});
