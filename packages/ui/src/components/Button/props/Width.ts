export const widths = ['auto', 'fit-content', 'full'] as const;

export type Width = (typeof widths)[number];
