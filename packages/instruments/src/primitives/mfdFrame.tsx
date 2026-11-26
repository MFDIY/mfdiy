import type { Decorator } from '@storybook/react-vite';

import { Box } from '@mfdiy/ui/components';

import { applyTokens } from '../theme/applyTokens.js';
import { root } from '../theme/root.css.js';
import { builtInThemes } from '../theme/themes.js';

/**
 * Stories only: draws a primitive on an MFD in the theme picked in the toolbar, at roughly the size
 * of a widget on a tablet, since primitives scale with the cell they're in.
 */
export const mfdFrame: Decorator = (Story, context) => {
  const theme = builtInThemes.find(candidate => candidate.name === context.globals['theme']) ?? builtInThemes[0];

  return (
    <Box className={root} cssVariables={applyTokens(theme?.tokens)} padding='4x'>
      <div style={{ height: '120px', width: '240px' }}>
        <Story />
      </div>
    </Box>
  );
};
