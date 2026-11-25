import type { DocumentSummary } from '@mfdiy/schema';

import { createBlankDocument } from '@mfdiy/schema';
import { Box, Button, ButtonLink, Inline, Stack, Surface, Text } from '@mfdiy/ui/components';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useDocumentRequest, useLibrary } from '../documents/DocumentsProvider.js';
import { NameDialog } from '../documents/NameDialog.js';
import { ProfileDialog } from '../documents/ProfileDialog.js';
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
    <Box padding='6x' tagName='main'>
      <Stack spacing='5x'>
        <Text tagName='h1' variant='heading.1'>
          MFDIY
        </Text>
        <Text variant='body'>Build your MFD. No code required.</Text>
        <Text role='status' variant='deemphasized'>
          {statusText[status]}
          {status === 'open' && hello ? ` to ${hello.game.name} (${hello.source})` : null}
        </Text>
        <Inline alignItems='center' justifyContent='space-between' spacing='4x'>
          <Text tagName='h2' variant='heading.2'>
            Profiles
          </Text>
          <Button disabled={status !== 'open'} onClick={() => setCreating(true)} size='large' variant='attention'>
            New
          </Button>
        </Inline>
        {profiles?.length === 0 ? <Text variant='body'>No profiles yet.</Text> : null}
        {profiles?.map(profile => (
          <ProfileCard key={profile.id} onMore={() => setOpenId(profile.id)} profile={profile} />
        ))}
      </Stack>
      {creating && hello ? (
        <NameDialog
          initialName='New profile'
          onClose={() => setCreating(false)}
          onDone={id => void navigate(`/builder/${id}`)}
          onSubmit={name => request({ type: 'document-create', document: createBlankDocument(name, hello.game.id) })}
          submitLabel='Create'
          title='New profile'
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
    <Surface borderRadius='2x' elevation='raised' padding='4x' tagName='article'>
      <Inline alignItems='center' justifyContent='space-between' spacing='4x'>
        <Stack spacing='2x'>
          <Text tagName='h3' variant='heading.4'>
            {profile.name}
          </Text>
          <Text variant='deemphasized'>
            {profile.pageCount} {profile.pageCount === 1 ? 'page' : 'pages'}
          </Text>
        </Stack>
        <Inline spacing='3x'>
          <ButtonLink to={`/display/${profile.id}`}>Show</ButtonLink>
          <ButtonLink to={`/builder/${profile.id}`}>Edit</ButtonLink>
          <Button aria-label={`More for ${profile.name}`} onClick={onMore} size='large' variant='transparent'>
            …
          </Button>
        </Inline>
      </Inline>
    </Surface>
  );
}
