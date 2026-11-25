import type { Layout, MfdDocument } from '@mfdiy/schema';

import { Canvas } from '@mfdiy/builder';
import { DEFAULT_GRID, scaleLayout } from '@mfdiy/schema';
import { Text } from '@mfdiy/ui/components';
import { useState } from 'react';
import { Link } from 'react-router';

import { MfdWidget } from '../mfd/MfdWidget.js';
import { demoDocument } from '../mfd/demoDocument.js';

import * as styles from './builder.css.js';

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

  return (
    <main className={styles.builder}>
      <div className={styles.toolbar}>
        <Text variant='body'>
          <Link to='/'>Back</Link>
        </Text>
        <div className={styles.tabs}>
          {document.pages.map(candidate => (
            <button
              aria-pressed={candidate.id === pageId}
              className={styles.tab}
              key={candidate.id}
              onClick={() => {
                setPageId(candidate.id);
                setSelectedId(null);
              }}
              type='button'
            >
              {candidate.name}
            </button>
          ))}
        </div>
        <Text variant='deemphasized'>Changes aren’t saved yet</Text>
      </div>
      <div className={styles.stage}>
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
      </div>
    </main>
  );
}
