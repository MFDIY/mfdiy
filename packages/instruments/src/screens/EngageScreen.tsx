import { Box } from '@mfdiy/ui/components';

import * as styles from './EngageScreen.css.js';

export type EngageScreenProps = {
  /** The profile's name, shown above the prompt. */
  name?: string | undefined;
  /** Called on the tap, which browsers ask for before they keep the screen on. */
  onEngage?: (() => void) | undefined;
};

/**
 * "Tap to engage" (0005): shown in place of the MFD, in its theme and shape, until a tap starts
 * keeping the screen on. Unlike the MFD's buttons it answers to a whole tap (`click`), not a touch
 * (0010): the browser only counts a finished tap as the gesture it asks for, and the finger must
 * not land on the widget under it once the screen is gone.
 */
export function EngageScreen({ name, onEngage }: EngageScreenProps) {
  return (
    <Box containerType='size' height='full' width='full'>
      <Box
        alignItems='center'
        appearance='none'
        className={styles.screen}
        cursor='pointer'
        display='flex'
        flexDirection='column'
        height='full'
        justifyContent='center'
        onClick={onEngage}
        padding='none'
        tagName='button'
        type='button'
        width='full'
      >
        {name ? <Box className={styles.name}>{name}</Box> : null}
        <Box className={styles.prompt}>Tap to engage</Box>
      </Box>
    </Box>
  );
}
