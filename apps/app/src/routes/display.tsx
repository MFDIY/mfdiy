import { Box } from '@mfdiy/ui/components';
import { useParams, useSearchParams } from 'react-router';

import { DocumentPlaceholder } from '../documents/DocumentPlaceholder.js';
import { useWatchedDocument } from '../documents/DocumentsProvider.js';
import { MfdRenderer } from '../mfd/MfdRenderer.js';

/**
 * Full-screen MFD, following every save. The profile and page are in the address, so a refresh or
 * bookmark opens the same ones.
 */
export default function Display() {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const watched = useWatchedDocument(id);

  if (watched.status !== 'ready') {
    return <DocumentPlaceholder status={watched.status} />;
  }

  const { document } = watched.stored;

  return (
    <Box
      height='viewport'
      overflow='hidden'
      overscrollBehavior='none'
      tagName='main'
      touchAction='none'
      width='viewport'
    >
      <MfdRenderer
        document={document}
        onPageChange={page => setSearchParams({ page }, { replace: true })}
        pageId={searchParams.get('page') ?? document.pages[0]?.id ?? ''}
      />
    </Box>
  );
}
