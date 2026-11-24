import { token } from '../theme/token.js';

export const glow = (color: string) => `0 0 ${token('size.glow')} color-mix(in srgb, ${color} 60%, transparent)`;

export const transition = (...properties: string[]) =>
  properties.map(property => `${property} ${token('motion.duration')} ease`).join(', ');
