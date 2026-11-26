/** Where a sheet rests: half the screen, keeping what's above it in view, or the full height. */
export const stops = ['half', 'full'] as const;

export type Stop = (typeof stops)[number];
