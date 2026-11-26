import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '@mfdiy/ui/components';

import { Bar } from './primitives/Bar.js';
import { Button } from './primitives/Button.js';
import { Light } from './primitives/Light.js';
import { Readout } from './primitives/Readout.js';
import { applyTokens } from './theme/applyTokens.js';
import { root } from './theme/root.css.js';
import { builtInThemes } from './theme/themes.js';

function Showcase({ themeName }: { themeName: string }) {
  const theme = builtInThemes.find(candidate => candidate.name === themeName) ?? builtInThemes[0];

  return (
    <Box
      className={root}
      display='grid'
      style={{
        ...applyTokens(theme?.tokens),
        gap: '12px',
        gridAutoRows: '96px',
        gridTemplateColumns: 'repeat(4, 1fr)',
        minHeight: '100vh',
        padding: '16px'
      }}
    >
      <Light label='Gear' state='on' />
      <Light label='Decpl' state='off' />
      <Light label='QT Low' state='warning' />
      <Light label='Hull' state='critical' />
      <Box style={{ gridColumn: 'span 2' }}>
        <Bar displayValue='92%' label='Shield front' state='normal' value={0.92} />
      </Box>
      <Box style={{ gridColumn: 'span 2' }}>
        <Bar displayValue='18%' label='Quantum fuel' state='warning' value={0.18} />
      </Box>
      <Box style={{ gridColumn: 'span 2' }}>
        <Readout label='SCM speed' unit='m/s' value='212' />
      </Box>
      <Button label='Gear' onPress={() => {}} status='idle' />
      <Button label='Doors' onPress={() => {}} status='failed' />
    </Box>
  );
}

export default {
  title: 'Instruments/Showcase',
  render: (_args, context) => <Showcase themeName={String(context.globals['theme'] ?? '')} />
} satisfies Meta;

export const AllPrimitives: StoryObj = {};
