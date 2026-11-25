import type { DesignSystem } from '../../styles/design-system.js';

import { Box } from '../Box/Box.js';

import * as styles from './ScrollEdge.css.js';

type Edge = 'bottom' | 'top';

type Props = {
  edge: Edge;
  show: boolean;
};

const translateMap = {
  bottom: 'down-full',
  top: 'up-full'
} as const satisfies Record<Edge, DesignSystem['transform']>;

export function ScrollEdge({ edge, show }: Props) {
  return (
    <Box
      bottom={edge === 'bottom' ? 'none' : undefined}
      className={styles.shadow[edge]}
      height='3x'
      insetX='none'
      pointerEvents='none'
      position='absolute'
      top={edge === 'top' ? 'none' : undefined}
      transform={show ? undefined : translateMap[edge]}
      transitionDuration='short'
      transitionProperty='transform'
      transitionTimingFunction='ease-out'
      zIndex='3'
    />
  );
}
