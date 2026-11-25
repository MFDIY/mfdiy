import { Box } from '@mfdiy/ui/components';
import { useSearchParams } from 'react-router';

import { MfdRenderer } from '../mfd/MfdRenderer.js';
import { demoDocument } from '../mfd/demoDocument.js';

/** Full-screen MFD. Pages are kept in the URL so a refresh stays on the same page. */
export default function Display() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageId = searchParams.get('page') ?? demoDocument.pages[0]?.id ?? '';

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
        document={demoDocument}
        onPageChange={page => setSearchParams({ page }, { replace: true })}
        pageId={pageId}
      />
    </Box>
  );
}
