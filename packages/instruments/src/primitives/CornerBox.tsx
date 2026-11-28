import type { ReactNode } from 'react';

import { Frame } from './Frame.js';
import { cornerBox } from './Pressable.css.js';

export type CornerBoxProps = {
  children: ReactNode;
};

/**
 * The room a widget without an action keeps around itself, where a pressable one draws its
 * corners, so widgets line up whether they can be pressed or not (0018).
 */
export function CornerBox({ children }: CornerBoxProps) {
  return <Frame className={cornerBox}>{children}</Frame>;
}
