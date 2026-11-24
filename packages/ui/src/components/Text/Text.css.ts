import { style, styleVariants } from '@vanilla-extract/css';

import { designSystem } from '../../styles/design-system.js';

export const root = style({});

export const uppercase = style({ textTransform: 'uppercase' });

export const variants = styleVariants({
  body: [
    root,
    designSystem({
      fontSize: 'body',
      fontWeight: 'body',
      letterSpacing: 'body',
      lineHeight: 'body'
    })
  ],
  'button.large': [
    root,
    designSystem({
      fontSize: 'button.large',
      fontWeight: 'button',
      letterSpacing: 'button',
      lineHeight: 'button'
    })
  ],
  'button.small': [
    root,
    designSystem({
      fontSize: 'button.small',
      fontWeight: 'button',
      letterSpacing: 'button',
      lineHeight: 'button'
    })
  ],
  'button.standard': [
    root,
    designSystem({
      fontSize: 'button.standard',
      fontWeight: 'button',
      letterSpacing: 'button',
      lineHeight: 'button'
    })
  ],
  'command.description': [
    root,
    designSystem({
      fontSize: 'command.description',
      fontWeight: 'command.description',
      letterSpacing: 'body',
      lineHeight: 'body'
    })
  ],
  'command.label': [
    root,
    designSystem({
      fontSize: 'command.label',
      fontWeight: 'command.label',
      letterSpacing: 'body',
      lineHeight: 'button'
    })
  ],
  deemphasized: [
    root,
    designSystem({
      fontSize: 'inherit',
      fontWeight: 'deemphasized',
      letterSpacing: 'inherit'
    })
  ],
  display: [
    root,
    designSystem({
      fontSize: 'display',
      fontWeight: 'display',
      letterSpacing: 'display',
      lineHeight: 'display'
    })
  ],
  'field.description': [
    root,
    designSystem({
      fontSize: 'field.description',
      fontWeight: 'field.description',
      letterSpacing: 'field.description',
      lineHeight: 'body'
    })
  ],
  'field.error': [
    root,
    designSystem({
      fontSize: 'field.error',
      fontWeight: 'field.error',
      letterSpacing: 'field.error',
      lineHeight: 'body'
    })
  ],
  'field.label': [
    root,
    designSystem({
      fontSize: 'field.label',
      fontWeight: 'field.label',
      letterSpacing: 'field.label',
      lineHeight: 'body'
    })
  ],
  'field.legend': [
    root,
    designSystem({
      fontSize: 'field.legend',
      fontWeight: 'field.legend',
      letterSpacing: 'field.legend',
      lineHeight: 'body'
    })
  ],
  'heading.1': [
    root,
    designSystem({
      fontSize: 'heading.1',
      fontWeight: 'heading',
      letterSpacing: 'heading',
      lineHeight: 'heading'
    })
  ],
  'heading.2': [
    root,
    designSystem({
      fontSize: 'heading.2',
      fontWeight: 'heading',
      letterSpacing: 'heading',
      lineHeight: 'heading'
    })
  ],
  'heading.3': [
    root,
    designSystem({
      fontSize: 'heading.3',
      fontWeight: 'heading',
      letterSpacing: 'heading',
      lineHeight: 'heading'
    })
  ],
  'heading.4': [
    root,
    designSystem({
      fontSize: 'heading.4',
      fontWeight: 'heading',
      letterSpacing: 'heading',
      lineHeight: 'heading'
    })
  ],
  'input.text': [
    root,
    designSystem({
      fontSize: 'input.text',
      fontWeight: 'input',
      letterSpacing: 'input',
      lineHeight: 'input'
    })
  ],
  'input.textarea': [
    root,
    designSystem({
      fontSize: 'input.text',
      fontWeight: 'input',
      letterSpacing: 'input',
      lineHeight: 'textarea'
    })
  ],
  'panel.header': [
    root,
    designSystem({
      fontSize: 'panel.header',
      fontWeight: 'panel.header',
      letterSpacing: 'panel.header',
      lineHeight: 'button'
    }),
    style({ textTransform: 'uppercase' })
  ],
  shortcut: [
    root,
    designSystem({
      fontSize: 'shortcut',
      fontWeight: 'shortcut',
      letterSpacing: 'shortcut',
      lineHeight: 'body'
    })
  ],
  'table.cell': [
    root,
    designSystem({
      fontSize: 'table.cell',
      fontWeight: 'table.cell',
      letterSpacing: 'table.cell',
      lineHeight: 'body'
    })
  ],
  'table.header': [
    root,
    designSystem({
      fontSize: 'table.header',
      fontWeight: 'table.header',
      letterSpacing: 'table.header',
      lineHeight: 'button'
    }),
    style({ textTransform: 'uppercase' })
  ],
  tooltip: [
    root,
    designSystem({
      fontSize: 'tooltip',
      fontWeight: 'tooltip',
      letterSpacing: 'tooltip',
      lineHeight: 'body'
    })
  ]
});

export const truncate = designSystem({
  display: 'block',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
});
