import type { WatchedDocument } from './DocumentStore.js';

import { Box, Stack, Text, TextLink } from '@mfdiy/ui/components';

import { useConnection } from '../telemetry/TelemetryProvider.js';

/** Stands in for a profile that hasn't arrived, or never will. */
export function DocumentPlaceholder({ status }: { status: Exclude<WatchedDocument['status'], 'ready'> }) {
  const connection = useConnection();

  return (
    <Box padding='6x'>
      <Stack spacing='5x'>
        <Text role='status' variant='body'>
          {status === 'missing'
            ? 'This profile doesn’t exist. It may have been deleted on another device.'
            : connection.status === 'open'
              ? 'Loading…'
              : 'Waiting for the bridge…'}
        </Text>
        <Text variant='body'>
          <TextLink to='/'>All profiles</TextLink>
        </Text>
      </Stack>
    </Box>
  );
}
