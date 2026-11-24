export const order = ['normal', 'reversed'] as const;

export type Order = (typeof order)[number];
