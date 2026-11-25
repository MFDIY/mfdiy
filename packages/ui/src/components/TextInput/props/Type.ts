export const types = ['email', 'hidden', 'password', 'search', 'tel', 'text', 'url'] as const;

export type Type = (typeof types)[number];
