import type { CSSProperties } from 'react';

import { Box } from '../Box/Box.js';

export type PlaceholderProps = Pick<CSSProperties, 'aspectRatio' | 'height' | 'width'>;

export function Placeholder({ aspectRatio, height = '100%', width = '100%' }: PlaceholderProps) {
  const svgStyle = {
    backgroundColor: '#9992',
    border: '2px solid #9996',
    display: 'block',
    height: '100%',
    lineHeight: '0',
    width: '100%'
  };

  return (
    <Box style={{ aspectRatio, height, width }}>
      <Box style={svgStyle} tagName='svg' xmlns='http://www.w3.org/2000/svg'>
        <Box stroke='#9994' strokeWidth='2px' tagName='line' x1='0' x2='100%' y1='0' y2='100%'></Box>
        <Box stroke='#9994' strokeWidth='2px' tagName='line' x1='100%' x2='0' y1='0' y2='100%'></Box>
      </Box>
    </Box>
  );
}
