import { AppHeader } from '@mfdiy/builder';
import { EngageScreen, pageToken } from '@mfdiy/instruments';
import { Box } from '@mfdiy/ui/components';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';

import { DocumentPlaceholder } from '../documents/DocumentPlaceholder.js';
import { useWatchedDocument } from '../documents/DocumentsProvider.js';
import { Editor } from '../editor/Editor.js';
import { useKeepAwake } from '../keepAwake/KeepAwakeProvider.js';
import { MfdRenderer } from '../mfd/MfdRenderer.js';
import { ScreenShape } from '../mfd/ScreenShape.js';
import { canFullscreen, enterFullscreen, useFullscreen } from '../mfd/fullscreen.js';

/** Navigation state that opens a profile in the editor, e.g. one just created (0019). */
export type ProfileState = { edit: true };

export default function Profile() {
  const { id = '' } = useParams();

  return <ProfileView id={id} key={id} />;
}

/**
 * One address per profile (0009): `/<id>`, with the page shown in `?page=`. It shows the MFD,
 * working and following every save, under a header with Edit and Fullscreen. Editing is a mode of
 * the same address, so a refresh or a bookmark shows the profile. Until a tap keeps the screen on,
 * the MFD waits behind "Tap to engage" (0005).
 */
function ProfileView({ id }: { id: string }) {
  const watched = useWatchedDocument(id);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fullscreen = useFullscreen();
  const keepAwake = useKeepAwake();
  const [editing, setEditing] = useState(() => (location.state as ProfileState | null)?.edit === true);

  useEffect(() => {
    if (location.state !== null) {
      void navigate({ search: location.search }, { replace: true });
    }
  }, [location.state, location.search, navigate]);

  const document = watched.status === 'ready' ? watched.stored.document : undefined;
  const pageId = searchParams.get('page') ?? document?.pages[0]?.id ?? '';

  function showPage(page: string) {
    void setSearchParams({ page }, { replace: true });
  }

  if (editing) {
    return (
      <Editor
        id={id}
        initialPageId={pageId}
        onLeave={page => {
          showPage(page);
          setEditing(false);
        }}
      />
    );
  }

  const page = document?.pages.find(candidate => candidate.id === pageId) ?? document?.pages[0];

  return (
    <Box
      display='flex'
      flexDirection='column'
      height='viewport'
      overflow='hidden'
      overscrollBehavior='none'
      tagName='main'
      width='viewport'
    >
      {fullscreen ? null : (
        <Box borderBottomColor='line' borderBottomStyle='solid' borderBottomWidth='hairline' flexShrink='0'>
          <AppHeader
            accent={document ? pageToken('accent', document.tokens, page?.tokens) : undefined}
            keepAwake={keepAwake.method === 'off' || keepAwake.method === 'starting' ? undefined : keepAwake.method}
            onEdit={document ? () => setEditing(true) : undefined}
            onFullscreen={canFullscreen() ? enterFullscreen : undefined}
            onHome={() => void navigate('/')}
          />
        </Box>
      )}
      <Box flexBasis='fluid' flexGrow='1' minHeight='none' touchAction='none'>
        {document ? (
          <ScreenShape document={document}>
            {keepAwake.method === 'off' ? (
              <EngageScreen name={document.name} onEngage={keepAwake.engage} />
            ) : (
              <MfdRenderer document={document} onPageChange={showPage} pageId={pageId} />
            )}
          </ScreenShape>
        ) : (
          <DocumentPlaceholder status={watched.status === 'missing' ? 'missing' : 'loading'} />
        )}
      </Box>
    </Box>
  );
}
