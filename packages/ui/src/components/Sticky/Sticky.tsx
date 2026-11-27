import type { ReactNode } from 'react';

import { useCallback, useState } from 'react';

import { useIntersectionObservation } from '../../contexts/IntersectionObserverProvider/IntersectionObserverProvider.js';
import { Box } from '../Box/Box.js';
import { ScrollEdge } from '../ScrollContainer/ScrollEdge.js';

export const stickyEdges = ['top', 'bottom'] as const;

export type StickyEdge = (typeof stickyEdges)[number];

export type StickyProps = {
  children: ReactNode;
  /** Which edge of the scroll area it stays at. Defaults to `top`. */
  edge?: StickyEdge | undefined;
};

/**
 * Keeps its content in view at an edge of the `ScrollContainer` it's in, such as a search field
 * above a list, on the background of whatever it's in. While content scrolls underneath it, a
 * hairline on its inner side says so, as the container's own edge does (0022); a top `Sticky`
 * takes the place of the container's top hairline.
 */
export function Sticky({ children, edge = 'top' }: StickyProps) {
  const [covering, setCovering] = useState(false);

  const handleObservation = useCallback(
    (entry: IntersectionObserverEntry) => {
      const { boundingClientRect, isIntersecting, rootBounds } = entry;
      const passed =
        rootBounds !== null &&
        (edge === 'top' ? boundingClientRect.top < rootBounds.top : boundingClientRect.bottom > rootBounds.bottom);

      setCovering(!isIntersecting && passed);
    },
    [edge]
  );

  const markerRef = useIntersectionObservation(handleObservation);

  const content = (
    <Box
      backgroundColor='inherit'
      bottom={edge === 'bottom' ? 'none' : undefined}
      data-sticky={edge}
      position='sticky'
      top={edge === 'top' ? 'none' : undefined}
      zIndex='2'
    >
      {children}
      <ScrollEdge edge={edge === 'top' ? 'bottom' : 'top'} show={covering} />
    </Box>
  );

  return edge === 'top' ? (
    <>
      <Box ref={markerRef} />
      {content}
    </>
  ) : (
    <>
      {content}
      <Box ref={markerRef} />
    </>
  );
}
