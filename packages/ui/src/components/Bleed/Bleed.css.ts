import { styleVariants } from '@vanilla-extract/css';

import { spacing } from '../../styles/properties.js';

const negative = (value: string) => `calc(-1 * ${value})`;

/** How far it reaches out past the padding around it, per side. */
export const bottom = styleVariants(spacing, value => ({ marginBottom: negative(value) }));
export const horizontal = styleVariants(spacing, value => ({ marginInline: negative(value) }));
export const top = styleVariants(spacing, value => ({ marginTop: negative(value) }));
