import { token } from '@mfdiy/instruments';
import { style } from '@vanilla-extract/css';

export const screen = style({
  gap: 'clamp(4px, 1.5vmin, 16px)',
  gridTemplateRows: '1fr auto',
  padding: 'clamp(4px, 1.5vmin, 16px)'
});

export const page = style({
  gap: 'clamp(4px, 1.5vmin, 16px)'
});

export const tabs = style({
  gap: 'clamp(4px, 1.5vmin, 16px)'
});

export const tab = style({
  border: `${token('size.border')} solid ${token('outline')}`,
  borderRadius: token('size.radius'),
  color: token('text.dim'),
  font: 'inherit',
  letterSpacing: '0.12em',
  padding: 'clamp(6px, 1.5vmin, 12px)',
  textTransform: 'uppercase',

  selectors: {
    '&[aria-current="page"]': {
      borderColor: token('state.on'),
      color: token('state.on')
    }
  }
});

export const unknownWidget = style({
  border: `${token('size.border')} dashed ${token('state.warning')}`,
  color: token('state.warning')
});
