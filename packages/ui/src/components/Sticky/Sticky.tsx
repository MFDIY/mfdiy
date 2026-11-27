import type { ReactNode } from 'react';

import { useCallback, useState } from 'react';

import { useIntersectionObservation } from '../../contexts/IntersectionObserverProvider/IntersectionObserverProvider.js';
import { surfaceBackground } from '../../styles/surface.css.js';
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
 * above a list, or an accordion's open row above its content, on the colour of the sheet or
 * sidebar it's in. While content scrolls underneath it, a hairline on its inner side says so, as
 * the container's own edge does (0022); a top `Sticky` then takes the place of the container's top
 * hairline. It sticks one pixel past the edge, so it can tell it's stuck: that pixel is cut off.
 */
export function Sticky({ children, edge = 'top' }: StickyProps) {
  const [covering, setCovering] = useState(false);

  const handleObservation = useCallback(
    (entry: IntersectionObserverEntry) => {
      const { boundingClientRect, intersectionRatio, isIntersecting, rootBounds } = entry;
      const atEdge =
        rootBounds !== null &&
        (edge === 'top' ? boundingClientRect.top < rootBounds.top : boundingClientRect.bottom > rootBounds.bottom);

      setCovering(isIntersecting && intersectionRatio < 1 && atEdge);
    },
    [edge]
  );

  const ref = useIntersectionObservation(handleObservation);

  return (
    <Box
      bottom={edge === 'bottom' ? 'sticky' : undefined}
      className={surfaceBackground}
      data-covering={covering ? '' : undefined}
      data-sticky={edge}
      position='sticky'
      ref={ref}
      top={edge === 'top' ? 'sticky' : undefined}
      zIndex='2'
    >
      {children}
      <ScrollEdge edge={edge === 'top' ? 'bottom' : 'top'} show={covering} />
    </Box>
  );
}
