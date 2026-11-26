export const variants = ['default', 'primary', 'quiet', 'danger'] as const;

export type Variant = (typeof variants)[number];
