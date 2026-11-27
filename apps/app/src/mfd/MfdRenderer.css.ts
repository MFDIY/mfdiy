import { token } from '@mfdiy/instruments';
import { style } from '@vanilla-extract/css';

/*
 * Spacing comes from the theme (`gap`). The screen sits in `ScreenShape`, a size container in the
 * profile's shape, so `cqmin` resolves against that, as it does against the page in the builder.
 */
export const screen = style({
  padding: token('gap')
});

export const page = style({
  gap: token('gap')
});

export const unknownWidget = style({
  border: `${token('border.width')} dashed ${token('status.critical')}`,
  color: token('status.critical')
});
