import type { PropsWithChildren, Ref } from 'react';

import { useMergeRefs } from '@floating-ui/react';

import {
  IntersectionObserverProvider,
  useIntersectionObserver
} from '../../contexts/IntersectionObserverProvider/IntersectionObserverProvider.js';
import { Box, type ViewTransitionNameProp } from '../Box/Box.js';

import * as styles from './ScrollContainer.css.js';
import { ScrollContent } from './ScrollContent.js';

export type ScrollContainerProps = PropsWithChildren<{
  /** Sets a callback to handle changes to whether content is overflowing at the bottom of the scroll container. */
  onOverflowBottom?: ((overflowing: boolean) => void) | undefined;
  /** Sets a callback to handle changes to whether content is overflowing at the top of the scroll container. */
  onOverflowTop?: ((overflowing: boolean) => void) | undefined;
  /** Ref forwarded to the scrollable element. */
  scrollRef?: Ref<HTMLElement | null> | undefined;
  /** Configures a name for view transitions on this element. */
  viewTransitionName?: ViewTransitionNameProp | undefined;
}>;

export function ScrollContainer({
  children,
  onOverflowBottom,
  onOverflowTop,
  scrollRef,
  viewTransitionName
}: ScrollContainerProps) {
  const [observerRootRef, intersectionObserver] = useIntersectionObserver({ rootMargin: '0px 0px 1px 0px' });

  const mergedRef = useMergeRefs<HTMLElement | null>([observerRootRef, scrollRef]);

  return (
    <Box
      className={styles.root}
      display='flex'
      flexDirection='column'
      flexGrow='1'
      minHeight='none'
      minWidth='none'
      overflow='hidden'
      position='relative'
      viewTransitionName={viewTransitionName}
    >
      <IntersectionObserverProvider intersectionObserver={intersectionObserver}>
        <ScrollContent onOverflowBottom={onOverflowBottom} onOverflowTop={onOverflowTop} ref={mergedRef}>
          {children}
        </ScrollContent>
      </IntersectionObserverProvider>
    </Box>
  );
}
