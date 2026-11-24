export const elevations = ['base', 'depressed', 'floating', 'raised'] as const;

export type Elevation = (typeof elevations)[number];
