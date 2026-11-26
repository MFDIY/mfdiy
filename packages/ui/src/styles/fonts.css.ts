import { globalFontFace } from '@vanilla-extract/css';

/**
 * Fonts bundled with MFDIY, so the interface looks the same on every device instead of falling
 * back to whatever monospace font the viewer has installed. The app is served by the bridge on the
 * local network (0004), so fonts can't come from a CDN either. Declaring a font costs nothing until
 * something uses it.
 *
 * Martian Mono 1.1.0 (Evil Martians, SIL Open Font License; see `../fonts/MartianMono-OFL.txt`):
 * one variable file with every width (75–112.5 %) and weight (100–800), Latin and Cyrillic.
 */
globalFontFace('Martian Mono', {
  fontDisplay: 'swap',
  fontStretch: '75% 112.5%',
  fontStyle: 'normal',
  fontWeight: '100 800',
  src: `url('../fonts/MartianMono.woff2') format('woff2')`
});
