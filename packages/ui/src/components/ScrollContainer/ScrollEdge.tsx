import { Box } from '../Box/Box.js';

import * as styles from './ScrollEdge.css.js';

type Edge = 'bottom' | 'top';

type Props = {
  edge: Edge;
  show: boolean;
};

export function ScrollEdge({ edge, show }: Props) {
  return (
    <Box
      bottom={edge === 'bottom' ? 'none' : undefined}
      className={styles.edge}
      data-scroll-edge={edge}
      insetX='none'
      opacity={show ? '1' : '0'}
      pointerEvents='none'
      position='absolute'
      top={edge === 'top' ? 'none' : undefined}
      transitionDuration='short'
      transitionProperty='opacity'
      transitionTimingFunction='ease-out'
      zIndex='3'
    />
  );
}
