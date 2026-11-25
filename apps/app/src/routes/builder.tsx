import type { Layout, MfdDocument } from '@mfdiy/schema';

import { Canvas } from '@mfdiy/builder';
import { DEFAULT_GRID, scaleLayout } from '@mfdiy/schema';
import { Box, Inline, SegmentedControl, Text, TextLink } from '@mfdiy/ui/components';
import { useState } from 'react';

import { MfdWidget } from '../mfd/MfdWidget.js';
import { demoDocument } from '../mfd/demoDocument.js';

/** The demo on the default grid: its own grids are completely full, leaving nowhere to drag to. */
const initialDocument: MfdDocument = {
  ...demoDocument,
  pages: demoDocument.pages.map(page => ({
    ...page,
    layouts: page.layouts.map(layout => scaleLayout(layout, DEFAULT_GRID) ?? layout)
  }))
};

/** Edits the demo document in memory. Saving, the toolbar, palette and properties come next (0008). */
export default function Builder() {
  const [document, setDocument] = useState(initialDocument);
  const [pageId, setPageId] = useState(initialDocument.pages[0]?.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const page = document.pages.find(candidate => candidate.id === pageId);
  // Version 1 has exactly one layout per page (0006).
  const layout = page?.layouts[0];

  function handleLayoutChange(next: Layout) {
    setDocument(current => ({
      ...current,
      pages: current.pages.map(candidate =>
        candidate.id === pageId
          ? { ...candidate, layouts: candidate.layouts.map((other, index) => (index === 0 ? next : other)) }
          : candidate
      )
    }));
  }

  function handlePageChange(id: string) {
    setPageId(id);
    setSelectedId(null);
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      height='viewport'
      overflow='hidden'
      overscrollBehavior='none'
      tagName='main'
    >
      <Box padding='3x'>
        <Inline alignItems='center' spacing='4x'>
          <Text variant='body'>
            <TextLink to='/'>Back</TextLink>
          </Text>
          {pageId ? (
            <SegmentedControl
              onChange={handlePageChange}
              options={document.pages.map(({ id, name }) => ({ label: name, value: id }))}
              value={pageId}
            />
          ) : null}
          <Text variant='deemphasized'>Changes aren’t saved yet</Text>
        </Inline>
      </Box>
      {/* Padded, so resize handles at the edges of the canvas stay on screen. */}
      <Box flexBasis='fluid' flexGrow='1' minHeight='none' padding='4x'>
        {page && layout ? (
          <Canvas
            documentTokens={document.tokens}
            key={page.id}
            layout={layout}
            onLayoutChange={handleLayoutChange}
            onSelect={setSelectedId}
            page={page}
            renderWidget={widget => <MfdWidget widget={widget} />}
            selectedId={selectedId}
          />
        ) : null}
      </Box>
    </Box>
  );
}
