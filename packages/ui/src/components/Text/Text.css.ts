import { style, styleVariants } from '@vanilla-extract/css';

import { designSystem } from '../../styles/design-system.js';

export const root = style({});

/**
 * Four variants, and more only when a screen needs them (0022). They set typography only: colour
 * is the `color` prop, so a label inside a button takes the button's colour.
 */
export const variants = styleVariants({
  /** Short names of things: field labels, section headings, buttons. Uppercase and tracked. */
  label: [
    root,
    designSystem({
      fontSize: 'label',
      fontWeight: 'regular',
      letterSpacing: 'label',
      lineHeight: 'body',
      textTransform: 'uppercase'
    })
  ],
  /** Running text, names and descriptions, in mixed case. */
  body: [root, designSystem({ fontSize: 'body', fontWeight: 'regular', letterSpacing: 'none', lineHeight: 'body' })],
  /** Numbers and other values. */
  value: [root, designSystem({ fontSize: 'value', fontWeight: 'regular', letterSpacing: 'none', lineHeight: 'body' })],
  /** The title of a page, panel or dialog. */
  heading: [
    root,
    designSystem({ fontSize: 'heading', fontWeight: 'bold', letterSpacing: 'none', lineHeight: 'heading' })
  ]
});

export const truncate = designSystem({
  display: 'block',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
});
