import { Frame } from './Frame.js';
import * as styles from './Label.css.js';

export type LabelProps = {
  text: string;
};

/** Static text, e.g. a heading or, given an action, a button's legend (0018). */
export function Label({ text }: LabelProps) {
  return (
    <Frame
      alignItems='center'
      className={styles.label}
      display='flex'
      justifyContent='center'
      overflow='hidden'
      whiteSpace='nowrap'
    >
      {text}
    </Frame>
  );
}
