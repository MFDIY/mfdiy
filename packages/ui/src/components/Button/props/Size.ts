export const sizes = ['large', 'small', 'standard'] as const;

export type Size = (typeof sizes)[number];
