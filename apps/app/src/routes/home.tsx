import { Box, Stack, Surface, Text } from '@mfdiy/ui/components';
import { Link } from 'react-router';

import { useConnection } from '../telemetry/TelemetryProvider.js';

const statusText = {
  connecting: 'Connecting to the bridge…',
  open: 'Connected',
  closed: 'Not connected. Is the bridge running?',
  incompatible: 'This bridge runs a different protocol version. Update MFDIY.'
} as const;

export default function Home() {
  const { status, hello } = useConnection();

  return (
    <Box padding='6x'>
      <Stack spacing='5x'>
        <Text tagName='h1' variant='heading.1'>
          MFDIY
        </Text>
        <Text variant='body'>Build your MFD. No code required.</Text>
        <Surface elevation='raised' padding='4x'>
          <Stack spacing='3x'>
            <Text variant='panel.header'>Bridge</Text>
            <Text variant='body'>{statusText[status]}</Text>
            {hello ? (
              <Text variant='deemphasized'>
                {hello.game.name} ({hello.source}): {hello.signals.length} signals, {hello.actions.length} actions
              </Text>
            ) : null}
          </Stack>
        </Surface>
        <Stack spacing='2x'>
          <Text variant='body'>
            <Link to='/display'>Open the display</Link>
          </Text>
          <Text variant='body'>
            <Link to='/builder'>Open the builder</Link>
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}
