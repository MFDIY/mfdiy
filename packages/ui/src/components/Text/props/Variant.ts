import { variants as textVariants } from '../Text.css.js';

export type Variant = keyof typeof textVariants;

export const variants = Object.keys(textVariants) as Variant[];
