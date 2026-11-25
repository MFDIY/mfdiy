import { useState, type PropsWithChildren, type RefCallback } from 'react';

import { useIntersectionObservation } from '../../contexts/IntersectionObserverProvider/IntersectionObserverProvider.js';
import { Box } from '../Box/Box.js';

import * as styles from './ScrollContent.css.js';
import { ScrollEdge } from './ScrollEdge.js';

type Props = PropsWithChildren<{
  onOverflowBottom?: ((overflowing: boolean) => void) | undefined;
  onOverflowTop?: ((overflowing: boolean) => void) | undefined;
  ref: RefCallback<HTMLElement> | null;
}>;

export function ScrollContent({ children, onOverflowBottom, onOverflowTop, ref }: Props) {
  const [topOverflowing, setTopOverflowing] = useState<boolean>(false);
  const [bottomOverflowing, setBottomOverflowing] = useState<boolean>(false);

  const topOverflowRef = useIntersectionObservation(entry => {
    const overflowing = entry.intersectionRatio < 1;
    setTopOverflowing(overflowing);
    if (typeof onOverflowTop === 'function') onOverflowTop(overflowing);
  });

  const bottomOverflowRef = useIntersectionObservation(entry => {
    const overflowing = entry.intersectionRatio < 1;
    setBottomOverflowing(overflowing);
    if (typeof onOverflowBottom === 'function') onOverflowBottom(overflowing);
  });

  return (
    <>
      <Box
        className={styles.container}
        display='flex'
        flexDirection='column'
        flexGrow='1'
        minHeight='none'
        minWidth='none'
        overflowX='clip'
        overflowY='auto'
        ref={ref}
      >
        <Box ref={topOverflowRef} />
        {children}
        <Box ref={bottomOverflowRef} />
      </Box>
      <ScrollEdge edge='top' show={topOverflowing} />
      <ScrollEdge edge='bottom' show={bottomOverflowing} />
    </>
  );
}
