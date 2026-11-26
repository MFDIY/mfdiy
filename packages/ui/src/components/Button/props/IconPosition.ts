export const iconPositions = ['leading', 'trailing'] as const;

export type IconPosition = (typeof iconPositions)[number];
