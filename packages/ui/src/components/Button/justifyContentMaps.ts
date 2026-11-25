import type { DesignSystem } from '../../styles/design-system.js';

export const textAlign = {
  center: 'center',
  'flex-end': 'right',
  'flex-start': 'left',
  'space-around': 'center',
  'space-between': 'center',
  stretch: 'center'
} as const satisfies Record<
  'center' | 'flex-end' | 'flex-start' | 'space-around' | 'space-between' | 'stretch',
  DesignSystem['textAlign']
>;
