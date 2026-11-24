import type { Variant } from './props/Variant.js';
import type { DesignSystem } from '../../styles/design-system.js';

export const fontSize = {
  body: 'body',
  'button.large': 'button.large',
  'button.small': 'button.small',
  'button.standard': 'button.standard',
  'command.description': 'command.description',
  'command.label': 'command.label',
  deemphasized: 'inherit',
  display: 'display',
  'field.description': 'field.description',
  'field.error': 'field.error',
  'field.label': 'field.label',
  'field.legend': 'field.legend',
  'heading.1': 'heading.1',
  'heading.2': 'heading.2',
  'heading.3': 'heading.3',
  'heading.4': 'heading.4',
  'input.text': 'input.text',
  'input.textarea': 'input.text',
  'panel.header': 'panel.header',
  shortcut: 'shortcut',
  'table.cell': 'table.cell',
  'table.header': 'table.header',
  tooltip: 'tooltip'
} as const satisfies Record<Variant, DesignSystem['fontSize']>;

export const fontWeight = {
  body: 'body',
  'button.large': 'button',
  'button.small': 'button',
  'button.standard': 'button',
  'command.description': 'command.description',
  'command.label': 'command.label',
  deemphasized: 'deemphasized',
  display: 'display',
  'field.description': 'field.description',
  'field.error': 'field.error',
  'field.label': 'field.label',
  'field.legend': 'field.legend',
  'heading.1': 'heading',
  'heading.2': 'heading',
  'heading.3': 'heading',
  'heading.4': 'heading',
  'input.text': 'input',
  'input.textarea': 'input',
  'panel.header': 'panel.header',
  shortcut: 'shortcut',
  'table.cell': 'table.cell',
  'table.header': 'table.header',
  tooltip: 'tooltip'
} as const satisfies Record<Variant, DesignSystem['fontWeight']>;

export const letterSpacing = {
  body: 'body',
  'button.large': 'button',
  'button.small': 'button',
  'button.standard': 'button',
  'command.description': 'body',
  'command.label': 'body',
  deemphasized: 'inherit',
  display: 'display',
  'field.description': 'field.description',
  'field.error': 'field.error',
  'field.label': 'field.label',
  'field.legend': 'field.legend',
  'heading.1': 'heading',
  'heading.2': 'heading',
  'heading.3': 'heading',
  'heading.4': 'heading',
  'input.text': 'input',
  'input.textarea': 'input',
  'panel.header': 'panel.header',
  shortcut: 'shortcut',
  'table.cell': 'table.cell',
  'table.header': 'table.header',
  tooltip: 'tooltip'
} as const satisfies Record<Variant, DesignSystem['letterSpacing']>;

export const lineHeight = {
  body: 'body',
  'button.large': 'button',
  'button.small': 'button',
  'button.standard': 'button',
  'command.description': 'body',
  'command.label': 'button',
  deemphasized: 'inherit',
  display: 'display',
  'field.description': 'body',
  'field.error': 'body',
  'field.label': 'body',
  'field.legend': 'body',
  'heading.1': 'heading',
  'heading.2': 'heading',
  'heading.3': 'heading',
  'heading.4': 'heading',
  'input.text': 'input',
  'input.textarea': 'textarea',
  'panel.header': 'button',
  shortcut: 'body',
  'table.cell': 'body',
  'table.header': 'button',
  tooltip: 'body'
} as const satisfies Record<Variant, DesignSystem['lineHeight']>;

/** Variants that additionally uppercase their text. Not itself conditionable per breakpoint. */
export const textTransform = {
  'panel.header': 'uppercase',
  'table.header': 'uppercase'
} as const satisfies Partial<Record<Variant, 'uppercase'>>;
