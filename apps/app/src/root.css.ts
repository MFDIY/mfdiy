import { globalStyle } from '@vanilla-extract/css';

/**
 * The app fills the screen and never scrolls as a page (0007); its parts scroll on their own. Kept
 * here, not in `@mfdiy/ui`, so Storybook's documentation pages can still scroll.
 */
globalStyle('body', {
  height: '100dvh',
  overflow: 'clip'
});
