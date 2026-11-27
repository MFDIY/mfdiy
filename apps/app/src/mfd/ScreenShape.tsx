import type { MfdDocument } from '@mfdiy/schema';
import type { ReactNode } from 'react';

import { applyTokens, mfdRoot } from '@mfdiy/instruments';
import { shapeRatio } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';

type ScreenShapeProps = {
  children: ReactNode;
  document: MfdDocument;
};

/**
 * The profile's shape on the screen (0006): as large as fits, centred, with bars in the theme's
 * background around it; or the whole screen, if the profile stretches. Its content is a size
 * container either way, as the page is in the builder, so it sizes itself the same.
 */
export function ScreenShape({ children, document }: ScreenShapeProps) {
  const ratio = shapeRatio(document.shape);

  return (
    <Box
      alignItems='center'
      className={mfdRoot}
      containerType='size'
      cssVariables={applyTokens(document.tokens)}
      display='flex'
      height='full'
      justifyContent='center'
      width='full'
    >
      <Box
        containerType='size'
        flexShrink='0'
        style={
          document.fit === 'stretch'
            ? { height: '100%', width: '100%' }
            : { height: `min(100cqh, ${100 / ratio}cqw)`, width: `min(100cqw, ${100 * ratio}cqh)` }
        }
      >
        {children}
      </Box>
    </Box>
  );
}
