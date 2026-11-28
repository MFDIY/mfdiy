import type { ProfileState } from './profile.js';
import type { DocumentSummary } from '@mfdiy/schema';

import { AppHeader } from '@mfdiy/builder';
import { createBlankDocument } from '@mfdiy/schema';
import { Box, Button, ButtonLink, Inline, Stack, Surface, Text } from '@mfdiy/ui/components';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useDocumentRequest, useLibrary } from '../documents/DocumentsProvider.js';
import { ProfileDialog } from '../documents/ProfileDialog.js';
import { ShapeDialog } from '../documents/ShapeDialog.js';
import { useConnection } from '../telemetry/TelemetryProvider.js';

const statusText = {
  connecting: 'Connecting to the bridge…',
  open: 'Connected',
  closed: 'Not connected. Is the bridge running?',
  incompatible: 'This bridge runs a different protocol version. Update MFDIY.'
} as const;

/** The library: every profile saved on the bridge. */
export default function Home() {
  const { status, hello } = useConnection();
  const library = useLibrary();
  const request = useDocumentRequest();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const profiles = library?.toSorted((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  const openProfile = profiles?.find(profile => profile.id === openId);

  return (
    <Box tagName='main'>
      <Box borderBottomColor='line' borderBottomStyle='solid' borderBottomWidth='hairline'>
        <AppHeader />
      </Box>
      <Box padding='6x'>
        <Stack spacing='5x'>
          <Text variant='body'>Build your MFD. No code required.</Text>
          <Text color='text.dim' role='status' variant='body'>
            {status === 'open' && hello
              ? `${hello.source === 'simulator' ? 'Simulating' : 'Connected to'} ${hello.game.name}`
              : statusText[status]}
          </Text>
          <Inline alignItems='center' justifyContent='space-between' spacing='4x'>
            <Text tagName='h1' variant='heading'>
              Profiles
            </Text>
            <Button disabled={status !== 'open'} onClick={() => setCreating(true)} variant='primary'>
              New
            </Button>
          </Inline>
          {profiles?.length === 0 ? <Text variant='body'>No profiles yet.</Text> : null}
          {profiles?.map(profile => (
            <ProfileCard key={profile.id} onMore={() => setOpenId(profile.id)} profile={profile} />
          ))}
        </Stack>
      </Box>
      {creating && hello ? (
        <ShapeDialog
          onClose={() => setCreating(false)}
          onDone={id => void navigate(`/${id}`, { state: { edit: true } satisfies ProfileState })}
          onSubmit={shape =>
            request({ type: 'document-create', document: createBlankDocument('New profile', hello.game.id, shape) })
          }
        />
      ) : null}
      {openProfile ? (
        <ProfileDialog key={openProfile.id} onClose={() => setOpenId(null)} profile={openProfile} />
      ) : null}
    </Box>
  );
}

function ProfileCard({ onMore, profile }: { onMore: () => void; profile: DocumentSummary }) {
  return (
    <Surface elevation='raised' padding='4x' tagName='article'>
      <Inline alignItems='center' justifyContent='space-between' spacing='4x'>
        <Stack spacing='2x'>
          <Text tagName='h2' variant='heading'>
            {profile.name}
          </Text>
          <Text color='text.dim' variant='body'>
            {profile.pageCount} {profile.pageCount === 1 ? 'page' : 'pages'}
          </Text>
        </Stack>
        <Inline spacing='3x'>
          <ButtonLink to={`/${profile.id}`}>Open</ButtonLink>
          <Button aria-label={`More for ${profile.name}`} onClick={onMore} variant='quiet'>
            …
          </Button>
        </Inline>
      </Inline>
    </Surface>
  );
}
