export const variants = ['attention', 'destructive', 'soft', 'transparent'] as const;

export type Variant = (typeof variants)[number];
