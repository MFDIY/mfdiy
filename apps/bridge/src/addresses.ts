import type { NetworkInterfaceInfo } from 'node:os';

/**
 * Names of network adapters that other devices rarely reach: virtual machines, containers, VPNs
 * and Windows' own virtual switches.
 */
const VIRTUAL_ADAPTER =
  /vethernet|hyper-v|wsl|virtualbox|vmware|vmnet|vbox|docker|br-|tailscale|zerotier|vpn|tun|tap|utun/i;

/**
 * The addresses other devices on the network can open the app at, the likeliest first (0004): a
 * home network's ranges before others, and real adapters before virtual ones. Loopback and
 * self-assigned (169.254.x.x) addresses are left out, since no other device can use them.
 */
export function lanAddresses(interfaces: NodeJS.Dict<NetworkInterfaceInfo[]>, port: number): string[] {
  const suffix = port === 80 ? '' : `:${port}`;

  return Object.entries(interfaces)
    .flatMap(([name, infos = []]) =>
      infos
        .filter(info => info.family === 'IPv4' && !info.internal && !info.address.startsWith('169.254.'))
        .map(info => ({ address: info.address, rank: rank(name, info.address) }))
    )
    .toSorted((a, b) => a.rank - b.rank)
    .map(({ address }) => `http://${address}${suffix}`);
}

function rank(adapter: string, address: string): number {
  const virtual = VIRTUAL_ADAPTER.test(adapter) ? 10 : 0;

  if (address.startsWith('192.168.')) {
    return virtual + 1;
  }

  if (address.startsWith('10.')) {
    return virtual + 2;
  }

  if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) {
    return virtual + 3;
  }

  return virtual + 4;
}
