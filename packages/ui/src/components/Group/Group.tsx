import type { ReactNode } from 'react';

import { Box } from '../Box/Box.js';
import { Text } from '../Text/Text.js';
import { Toggletip } from '../Toggletip/Toggletip.js';

import * as styles from './Group.css.js';

export type GroupProps = {
  children: ReactNode;
  /** A hint about the whole group, in a toggletip by its title (0022). */
  description?: string | undefined;
  title: string;
};

/**
 * A titled frame around fields that belong together, such as a widget's data: a hairline with the
 * title set into its top edge. A `fieldset`, so assistive technology announces the group by its
 * title. Its content sits inside the frame's padding, its edges lining up with the title's text; to
 * reach the frame, like an accordion's rows, wrap it in `Bleed` with that padding (3x).
 */
export function Group({ children, description, title }: GroupProps) {
  return (
    <Box
      borderColor='line'
      borderStyle='solid'
      borderWidth='hairline'
      margin='none'
      minWidth='none'
      paddingBottom='3x'
      paddingInline='3x'
      paddingTop='2x'
      tagName='fieldset'
    >
      <Box className={styles.legend} paddingInline='1x' tagName='legend'>
        <Box alignItems='center' display='flex' gap='1x'>
          <Text color='text' variant='label'>
            {title}
          </Text>
          {description ? <Toggletip label={`About ${title}`}>{description}</Toggletip> : null}
        </Box>
      </Box>
      {children}
    </Box>
  );
}
