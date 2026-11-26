import { token } from '@mfdiy/instruments';
import { style } from '@vanilla-extract/css';

/*
 * Spacing comes from the theme (`gap`). On the display there's no container above the screen, so
 * `cqmin` resolves against the viewport, as `vmin` would.
 */
export const screen = style({
  gap: token('gap'),
  gridTemplateRows: '1fr auto',
  padding: token('gap')
});

export const page = style({
  gap: token('gap')
});

export const tabs = style({
  gap: token('gap')
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
