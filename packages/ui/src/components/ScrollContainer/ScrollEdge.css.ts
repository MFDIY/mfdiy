import { styleVariants } from '@vanilla-extract/css';

export const shadow = styleVariants({
  bottom: {
    backgroundImage: `linear-gradient(to bottom, #0001, #0002)`,
    maskImage: `linear-gradient(to bottom, #0000, #000)`
  },
  top: {
    backgroundImage: `linear-gradient(to top, #0001, #0002)`,
    maskImage: `linear-gradient(to top, #0000, #000)`
  }
});
