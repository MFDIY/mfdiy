import { token } from '@mfdiy/instruments';
import { style } from '@vanilla-extract/css';

export const screen = style({
  display: 'grid',
  gap: 'clamp(4px, 1.5vmin, 16px)',
  gridTemplateRows: '1fr auto',
  height: '100%',
  padding: 'clamp(4px, 1.5vmin, 16px)'
});

export const page = style({
  display: 'grid',
  gap: 'clamp(4px, 1.5vmin, 16px)',
  minHeight: 0
});

export const tabs = style({
  display: 'flex',
  gap: 'clamp(4px, 1.5vmin, 16px)'
});

export const tab = style({
  appearance: 'none',
  backgroundColor: 'transparent',
  border: `${token('size.border')} solid ${token('outline')}`,
  borderRadius: token('size.radius'),
  color: token('text.dim'),
  cursor: 'pointer',
  flex: 1,
  font: 'inherit',
  letterSpacing: '0.12em',
  padding: 'clamp(6px, 1.5vmin, 12px)',
  textTransform: 'uppercase',
  touchAction: 'manipulation',

  selectors: {
    '&[aria-current="page"]': {
      borderColor: token('state.on'),
      color: token('state.on')
    }
  }
});

export const unknownWidget = style({
  alignItems: 'center',
  border: `${token('size.border')} dashed ${token('state.warning')}`,
  boxSizing: 'border-box',
  color: token('state.warning'),
  display: 'flex',
  height: '100%',
  justifyContent: 'center'
});
