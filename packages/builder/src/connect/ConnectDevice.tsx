import { Box, Columns, QrCode, Select, Stack, Text } from '@mfdiy/ui/components';

export type ConnectDeviceProfile = {
  id: string;
  name: string;
};

export type ConnectDeviceProps = {
  /** The address the code holds, one of `addresses`; the first when left out. */
  address?: string | undefined;
  /** Where other devices can open the app, the likeliest first, e.g. `http://192.168.1.20` (0004). */
  addresses: readonly string[];
  /** Fires with the address chosen, when the gaming PC has more than one. */
  onAddressChange: (address: string) => void;
  /** Fires with the id of the profile chosen, or `null` for all profiles. */
  onProfileChange: (id: string | null) => void;
  /** The id of the profile the code opens, or `null` for the list of profiles. */
  profile: string | null;
  profiles: readonly ConnectDeviceProfile[];
};

/** Profile ids are longer, so this can't be one. */
const ALL_PROFILES = 'all';

/**
 * Connecting a phone or tablet (0004): a QR code it can scan to open the app, or a profile
 * straight away, with the address to type as a fallback. A gaming PC on more than one network
 * (a VPN, a virtual machine) offers each of its addresses, the likeliest first.
 */
export function ConnectDevice({
  address,
  addresses,
  onAddressChange,
  onProfileChange,
  profile,
  profiles
}: ConnectDeviceProps) {
  const chosen = address !== undefined && addresses.includes(address) ? address : addresses[0];
  const opened = profiles.find(candidate => candidate.id === profile);
  const url = chosen === undefined || opened === undefined ? chosen : `${chosen}/${opened.id}`;

  return (
    <Stack spacing='5x'>
      <Text tagName='h1' variant='heading'>
        Connect a device
      </Text>
      {url === undefined ? (
        <Text variant='body'>
          This PC doesn’t seem to be on a network. Connect it to the same Wi-Fi or router as your phone or tablet, then
          reload and try again.
        </Text>
      ) : (
        <Columns collapseBelow={600} spacing='6x'>
          <Box flexShrink='0' width='panel'>
            <QrCode label={`QR code that opens ${url}`} value={url} />
          </Box>
          <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
            <Stack spacing='5x'>
              <Text variant='body'>
                Scan the code with the camera of a phone or tablet on the same network as this PC. It opens{' '}
                {opened ? opened.name : 'your profiles'} in its browser.
              </Text>
              <Select
                items={[
                  { label: 'All profiles', value: ALL_PROFILES },
                  ...profiles.map(candidate => ({ label: candidate.name, value: candidate.id }))
                ]}
                label='Opens'
                onChange={value => onProfileChange(value === null || value === ALL_PROFILES ? null : value)}
                value={opened?.id ?? ALL_PROFILES}
              />
              {addresses.length > 1 ? (
                <Select
                  description='This PC is on more than one network. If the code doesn’t open on your device, try another address.'
                  items={addresses.map(candidate => ({ label: candidate.replace(/^http:\/\//, ''), value: candidate }))}
                  label='Address'
                  onChange={value => (value === null ? undefined : onAddressChange(value))}
                  value={chosen ?? null}
                />
              ) : null}
              <Stack spacing='2x'>
                <Text color='text.dim' variant='body'>
                  Or type this address in its browser:
                </Text>
                <Text variant='value' wordBreak='break-all'>
                  {url}
                </Text>
              </Stack>
              <Text color='text.dim' variant='body'>
                Nothing opens? Check that both are on the same network, and that Windows Firewall lets MFDIY through.
              </Text>
            </Stack>
          </Box>
        </Columns>
      )}
    </Stack>
  );
}
