import { Box, Stack, Text } from '@mfdiy/ui/components';
import { Link } from 'react-router';

/** Placeholder until the builder exists. See docs/decisions/0001 for its interaction requirements. */
export default function Builder() {
  return (
    <Box padding='6x'>
      <Stack spacing='4x'>
        <Text tagName='h1' variant='heading.1'>
          Builder
        </Text>
        <Text variant='body'>Coming soon. For now, the display renders a built-in demo document.</Text>
        <Link to='/'>Back</Link>
      </Stack>
    </Box>
  );
}
