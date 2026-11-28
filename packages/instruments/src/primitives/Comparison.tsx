import type { ReactNode } from 'react';

import { Box } from '@mfdiy/ui/components';

import { applyTokens } from '../theme/applyTokens.js';
import { root } from '../theme/root.css.js';
import { builtInThemes } from '../theme/themes.js';

type ComparisonProps = {
  cell?: { height: number; width: number } | undefined;
  columns: readonly string[];
  rows: readonly { cells: readonly ReactNode[]; name: string }[];
  themeName: string;
};

/**
 * Stories only: a table of widgets on an MFD in the theme picked in the toolbar, one row per look
 * being compared, each cell about the size of a widget on a tablet.
 */
export function Comparison({ cell = { height: 88, width: 150 }, columns, rows, themeName }: ComparisonProps) {
  const theme = builtInThemes.find(candidate => candidate.name === themeName) ?? builtInThemes[0];
  const template = `112px repeat(${columns.length}, ${cell.width}px)`;

  return (
    <Box className={root} cssVariables={applyTokens(theme?.tokens)} padding='4x'>
      <div
        style={{
          display: 'grid',
          gap: '12px',
          gridAutoRows: `${cell.height}px`,
          gridTemplateColumns: template,
          gridTemplateRows: '16px'
        }}
      >
        <div />
        {columns.map(column => (
          <div key={column} style={{ alignSelf: 'end', font: '12px monospace', opacity: 0.7 }}>
            {column}
          </div>
        ))}
        {rows.map(row => [
          <div key={row.name} style={{ alignSelf: 'center', font: '12px monospace', opacity: 0.7 }}>
            {row.name}
          </div>,
          ...row.cells.map((content, index) => <div key={`${row.name}-${index}`}>{content}</div>)
        ])}
      </div>
    </Box>
  );
}
