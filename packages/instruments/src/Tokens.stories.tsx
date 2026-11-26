import type { Meta, StoryObj } from '@storybook/react-vite';

import { scaleNames, scaleSteps, token, tokenNames, tokens, type TokenName } from '@mfdiy/schema';
import { mfdiy } from '@mfdiy/ui';
import { Box } from '@mfdiy/ui/components';

import { applyTokens } from './theme/applyTokens.js';
import { root } from './theme/root.css.js';
import { builtInThemes, phosphor } from './theme/themes.js';

type Values = Partial<Record<TokenName, string>>;

const semanticNames = tokenNames.filter(name => tokens[name].tier === 'semantic');

const mono = { fontFamily: token('font.text') };

function Heading({ children }: { children: string }) {
  return (
    <Box
      style={{
        ...mono,
        color: token('text.dim'),
        fontSize: '11px',
        letterSpacing: token('label.tracking'),
        textTransform: token('label.case') as 'uppercase'
      }}
    >
      {children}
    </Box>
  );
}

function Scales({ values }: { values: Values }) {
  return (
    <Box display='grid' style={{ gap: '4px', gridTemplateColumns: '72px repeat(9, 1fr)' }}>
      {scaleNames.map(scale => (
        <Box key={scale} style={{ display: 'contents' }}>
          <Box style={{ ...mono, alignSelf: 'center', color: token('text'), fontSize: '11px' }}>{scale}</Box>
          {scaleSteps.map(step => (
            <Box display='flex' flexDirection='column' key={step} style={{ gap: '2px' }}>
              <Box style={{ backgroundColor: token(`${scale}.${step}`), height: '28px' }} />
              <Box style={{ ...mono, color: token('text.dim'), fontSize: '9px' }}>
                {step} {values[`${scale}.${step}`]}
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function Semantics() {
  return (
    <Box display='grid' style={{ gap: '4px 12px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      {semanticNames.map(name => {
        const spec = tokens[name];

        return (
          <Box alignItems='center' display='flex' key={name} style={{ gap: '8px' }}>
            <Box
              style={{
                backgroundColor: token(name),
                border: `1px solid ${token('line')}`,
                flexShrink: 0,
                height: '20px',
                width: '32px'
              }}
            />
            <Box style={{ ...mono, color: token('text'), fontSize: '11px' }}>
              {name}
              <Box style={{ color: token('text.dim') }} tagName='span'>
                {'fallback' in spec ? ` → ${spec.fallback}` : ''}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function Samples() {
  return (
    <Box alignItems='center' display='flex' style={{ gap: '16px' }}>
      <Box
        style={{
          border: `${token('border.width')} solid ${token('line')}`,
          borderRadius: token('radius'),
          color: token('text'),
          fontFamily: token('font.numeric'),
          fontSize: '28px',
          padding: '8px 12px'
        }}
      >
        212{' '}
        <Box style={{ color: token('text.dim'), fontSize: '12px' }} tagName='span'>
          m/s
        </Box>
      </Box>
      <Box
        style={{
          backgroundColor: token('status.on'),
          borderRadius: token('radius'),
          boxShadow: `0 0 ${token('glow')} color-mix(in srgb, ${token('status.on')} 60%, transparent)`,
          color: token('status.on.text'),
          fontFamily: token('font.text'),
          fontSize: '13px',
          letterSpacing: token('label.tracking'),
          padding: '10px 14px',
          textTransform: token('label.case') as 'uppercase'
        }}
      >
        Selected
      </Box>
      <Box style={{ ...mono, color: token('text'), fontSize: '13px' }}>Mixed case reads easier.</Box>
    </Box>
  );
}

function Sheet({ title, values, className }: { title: string; values: Values; className?: string }) {
  return (
    <Box
      className={className}
      display='flex'
      flexDirection='column'
      style={{
        ...applyTokens(values),
        backgroundColor: token('surface'),
        border: `1px solid ${token('line')}`,
        gap: '16px',
        padding: '16px'
      }}
    >
      <Box style={{ ...mono, color: token('text'), fontSize: '15px', fontWeight: 600 }}>{title}</Box>
      <Heading>Scales</Heading>
      <Scales values={values} />
      <Heading>Semantic</Heading>
      <Semantics />
      <Heading>Type, shape and glow</Heading>
      <Samples />
    </Box>
  );
}

function TokenSheets({ themeName }: { themeName: string }) {
  const theme = builtInThemes.find(candidate => candidate.name === themeName) ?? builtInThemes[0];

  return (
    <Box
      display='grid'
      style={{
        alignContent: 'start',
        backgroundColor: '#000',
        gap: '16px',
        minHeight: '100vh',
        gridTemplateColumns: 'repeat(auto-fit, minmax(560px, 1fr))',
        padding: '16px'
      }}
    >
      <Sheet title='mfdiy (the brand)' values={mfdiy} />
      <Sheet className={root} title={`${theme?.name ?? ''} (MFD theme)`} values={{ ...phosphor, ...theme?.tokens }} />
    </Box>
  );
}

export default {
  title: 'Instruments/Tokens',
  render: (_args, context) => <TokenSheets themeName={String(context.globals['theme'] ?? '')} />
} satisfies Meta;

/** Every scale and semantic token of the brand theme, next to the MFD theme chosen in the toolbar. */
export const Tokens: StoryObj = {};
