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
  border: `${token('border.width')} solid ${token('line')}`,
  borderRadius: token('radius'),
  color: token('text.dim'),
  font: 'inherit',
  letterSpacing: token('label.tracking'),
  padding: 'clamp(6px, 1.5vmin, 12px)',
  textTransform: token('label.case') as 'uppercase',

  selectors: {
    '&[aria-current="page"]': {
      borderColor: token('status.on'),
      color: token('status.on')
    }
  }
});

export const unknownWidget = style({
  border: `${token('border.width')} dashed ${token('status.critical')}`,
  color: token('status.critical')
});
