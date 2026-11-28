import { AppHeader, ConnectDevice } from '@mfdiy/builder';
import { Box, Text } from '@mfdiy/ui/components';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useLibrary } from '../documents/DocumentsProvider.js';
import { useConnection } from '../telemetry/TelemetryProvider.js';

/**
 * Connecting a phone or tablet (0004): `/connect`, or `/connect?profile=<id>` to open a profile
 * straight away. The bridge points to it from its window. The addresses come from the bridge, with
 * the port this page was served on, which is the bridge's own except during development.
 */
export default function Connect() {
  const { hello, status } = useConnection();
  const library = useLibrary();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [address, setAddress] = useState<string>();
  const [profile, setProfile] = useState(() => searchParams.get('profile'));

  const addresses = (hello?.addresses ?? []).map(candidate => withPort(candidate, window.location.port));
  const profiles = (library ?? []).toSorted((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

  return (
    <Box tagName='main'>
      <Box borderBottomColor='line' borderBottomStyle='solid' borderBottomWidth='hairline'>
        <AppHeader onHome={() => void navigate('/')} />
      </Box>
      <Box padding='6x'>
        {hello === undefined ? (
          <Text color='text.dim' role='status' variant='body'>
            {status === 'closed' ? 'Not connected. Is the bridge running?' : 'Connecting to the bridge…'}
          </Text>
        ) : (
          <ConnectDevice
            address={address}
            addresses={addresses}
            onAddressChange={setAddress}
            onProfileChange={setProfile}
            profile={profile}
            profiles={profiles}
          />
        )}
      </Box>
    </Box>
  );
}

function withPort(address: string, port: string): string {
  const url = new URL(address);

  url.port = port;

  return url.origin;
}
