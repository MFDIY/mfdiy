import { colorSchemeVars, globalVars } from './vars.css.js';

export const spacing = {
  '1x': globalVars['spacing.1x'],
  '2x': globalVars['spacing.2x'],
  '3x': globalVars['spacing.3x'],
  '4x': globalVars['spacing.4x'],
  '5x': globalVars['spacing.5x'],
  '6x': globalVars['spacing.6x'],
  '7x': globalVars['spacing.7x'],
  '8x': globalVars['spacing.8x'],
  none: globalVars['spacing.none']
} as const;

export const origin = [
  'center bottom',
  'center center',
  'center top',
  'left bottom',
  'left center',
  'left top',
  'right bottom',
  'right center',
  'right top'
] as const;

/* ---------------------- */

export const alignItems = ['center', 'flex-end', 'flex-start', 'stretch'] as const;

export const alignSelf = ['center', 'flex-end', 'flex-start', 'stretch'] as const;

export const appearance = ['auto', 'none', 'unset'] as const;

export const backdropFilter = {
  blur: 'blur(3px)',
  none: 'none'
};

export const backgroundColor = {
  'canvas.ghost': colorSchemeVars['color.surface.canvas.ghost'],
  'canvas.handle': colorSchemeVars['color.surface.canvas.handle'],
  'button.attention': colorSchemeVars['color.surface.button.attention'],
  'button.attention-active': colorSchemeVars['color.surface.button.attention-active'],
  'button.attention-disabled': colorSchemeVars['color.surface.button.attention-disabled'],
  'button.attention-hover': colorSchemeVars['color.surface.button.attention-hover'],
  'button.destructive': colorSchemeVars['color.surface.button.destructive'],
  'button.destructive-active': colorSchemeVars['color.surface.button.destructive-active'],
  'button.destructive-disabled': colorSchemeVars['color.surface.button.destructive-disabled'],
  'button.destructive-hover': colorSchemeVars['color.surface.button.destructive-hover'],
  'button.soft': colorSchemeVars['color.surface.button.soft'],
  'button.soft-active': colorSchemeVars['color.surface.button.soft-active'],
  'button.soft-disabled': colorSchemeVars['color.surface.button.soft-disabled'],
  'button.soft-hover': colorSchemeVars['color.surface.button.soft-hover'],
  'button.transparent': colorSchemeVars['color.surface.button.transparent'],
  'button.transparent-active': colorSchemeVars['color.surface.button.transparent-active'],
  'button.transparent-disabled': colorSchemeVars['color.surface.button.transparent-disabled'],
  'button.transparent-hover': colorSchemeVars['color.surface.button.transparent-hover'],
  'elevation.base': colorSchemeVars['color.surface.elevation.base'],
  'elevation.base-hover': colorSchemeVars['color.surface.elevation.base-hover'],
  'elevation.depressed': colorSchemeVars['color.surface.elevation.depressed'],
  'elevation.floating': colorSchemeVars['color.surface.elevation.floating'],
  'elevation.raised': colorSchemeVars['color.surface.elevation.raised'],
  page: colorSchemeVars['color.surface.page'],
  'page-transparent': `color-mix(${colorSchemeVars['color.surface.page']} 85%, transparent)`,
  panel: colorSchemeVars['color.surface.panel'],
  'shortcut-attention': colorSchemeVars['color.surface.shortcut-attention'],
  'shortcut-destructive': colorSchemeVars['color.surface.shortcut-destructive'],
  'shortcut-soft': colorSchemeVars['color.surface.shortcut-soft'],
  'shortcut-transparent': colorSchemeVars['color.surface.shortcut-transparent'],
  'table-cell-even': colorSchemeVars['color.surface.table.cell-even'],
  'table-cell-hover': colorSchemeVars['color.surface.table.cell-hover'],
  'table-cell-odd': colorSchemeVars['color.surface.table.cell-odd'],
  'table-header': colorSchemeVars['color.surface.table.header'],
  tooltip: colorSchemeVars['color.surface.tooltip'],
  transparent: 'transparent'
} as const;

export const backgroundImage = {
  /** A dot on every corner of the tile, so `backgroundSize` should be the size of one cell. */
  'canvas.dots': ['0 0', '100% 0', '0 100%', '100% 100%']
    .map(
      corner =>
        `radial-gradient(circle at ${corner}, ${colorSchemeVars['color.surface.canvas.dot']} 1.5px, transparent 2px)`
    )
    .join(', '),
  'canvas.overlap': `repeating-linear-gradient(45deg, ${colorSchemeVars['color.surface.canvas.overlap']} 0 6px, transparent 6px 12px)`,
  link: 'linear-gradient(to right, currentColor, color-mix(in srgb, currentColor 30%, transparent))'
} as const;

export const backgroundRepeat = ['no-repeat'] as const;

export const backgroundSize = {
  link: '0% .1em',
  'link-hover': '100% .1em'
} as const;

export const borderColor = {
  'canvas.ghost': colorSchemeVars['color.border.canvas.ghost'],
  'canvas.overlap': colorSchemeVars['color.border.canvas.overlap'],
  'canvas.handle': colorSchemeVars['color.border.canvas.handle'],
  divider: colorSchemeVars['color.border.divider'],
  'input.text': colorSchemeVars['color.border.input.text'],
  panel: colorSchemeVars['color.border.panel'],
  placeholder: colorSchemeVars['color.border.placeholder'],
  'shortcut-attention': colorSchemeVars['color.border.shortcut-attention'],
  'shortcut-destructive': colorSchemeVars['color.border.shortcut-destructive'],
  'shortcut-soft': colorSchemeVars['color.border.shortcut-destructive'],
  'shortcut-transparent': colorSchemeVars['color.border.shortcut-transparent'],
  transparent: 'transparent'
} as const;

export const borderStyle = ['dashed', 'hidden', 'solid'] as const;

export const borderWidth = {
  canvas: globalVars['border.width.canvas'],
  divider: '1px',
  'input.text': globalVars['border.width.input.text'],
  placeholder: globalVars['border.width.placeholder'],
  none: '0px',
  shortcut: globalVars['border.width.shortcut']
} as const;

export const boxShadow = {
  'canvas.halo': colorSchemeVars['color.shadow.canvas.halo'],
  'canvas.selected': colorSchemeVars['color.shadow.canvas.selected'],
  'button.attention': colorSchemeVars['color.shadow.elevation.raised'],
  'button.attention-active': colorSchemeVars['color.shadow.elevation.depressed'],
  'button.attention-disabled': colorSchemeVars['color.shadow.elevation.base-hover'],
  'button.attention-hover': colorSchemeVars['color.shadow.elevation.base-hover'],
  'button.destructive': colorSchemeVars['color.shadow.elevation.raised'],
  'button.destructive-active': colorSchemeVars['color.shadow.elevation.depressed'],
  'button.destructive-disabled': colorSchemeVars['color.shadow.elevation.base-hover'],
  'button.destructive-hover': colorSchemeVars['color.shadow.elevation.base-hover'],
  'button.soft': colorSchemeVars['color.shadow.elevation.raised'],
  'button.soft-active': colorSchemeVars['color.shadow.elevation.depressed'],
  'button.soft-disabled': colorSchemeVars['color.shadow.elevation.base-hover'],
  'button.soft-hover': colorSchemeVars['color.shadow.elevation.base-hover'],
  'button.transparent': 'none',
  'button.transparent-active': colorSchemeVars['color.shadow.elevation.depressed'],
  'button.transparent-disabled': 'none',
  'button.transparent-hover': 'none',
  'elevation.base': colorSchemeVars['color.shadow.elevation.base'],
  'elevation.base-hover': colorSchemeVars['color.shadow.elevation.base-hover'],
  'elevation.depressed': colorSchemeVars['color.shadow.elevation.depressed'],
  'elevation.floating': colorSchemeVars['color.shadow.elevation.floating'],
  'elevation.raised': colorSchemeVars['color.shadow.elevation.raised'],
  none: 'none'
} as const;

export const color = {
  body: colorSchemeVars['color.content.body'],
  deemphasized: colorSchemeVars['color.content.deemphasized'],
  'button.attention': colorSchemeVars['color.content.button.attention'],
  'button.attention-active': colorSchemeVars['color.content.button.attention-active'],
  'button.attention-disabled': colorSchemeVars['color.content.button.attention-disabled'],
  'button.attention-hover': colorSchemeVars['color.content.button.attention-hover'],
  'button.destructive': colorSchemeVars['color.content.button.destructive'],
  'button.destructive-active': colorSchemeVars['color.content.button.destructive-active'],
  'button.destructive-disabled': colorSchemeVars['color.content.button.destructive-disabled'],
  'button.destructive-hover': colorSchemeVars['color.content.button.destructive-hover'],
  'button.soft': colorSchemeVars['color.content.button.soft'],
  'button.soft-active': colorSchemeVars['color.content.button.soft-active'],
  'button.soft-disabled': colorSchemeVars['color.content.button.soft-disabled'],
  'button.soft-hover': colorSchemeVars['color.content.button.soft-hover'],
  'button.transparent': colorSchemeVars['color.content.button.transparent'],
  'button.transparent-active': colorSchemeVars['color.content.button.transparent-active'],
  'button.transparent-disabled': colorSchemeVars['color.content.button.transparent-disabled'],
  'button.transparent-hover': colorSchemeVars['color.content.button.transparent-hover'],
  'field.description': colorSchemeVars['color.content.field.description'],
  'field.error': colorSchemeVars['color.content.field.error'],
  'field.label': colorSchemeVars['color.content.field.label'],
  'field.label.required': colorSchemeVars['color.content.field.label.required'],
  'field.legend': colorSchemeVars['color.content.field.legend'],
  'input.text': colorSchemeVars['color.content.input.text'],
  'input.text.placeholder': colorSchemeVars['color.content.input.text.placeholder'],
  link: colorSchemeVars['color.content.link'],
  'link-hover': colorSchemeVars['color.content.link-hover'],
  'panel.header': colorSchemeVars['color.content.panel.header'],
  'shortcut-attention': `color-mix(${colorSchemeVars['color.content.shortcut-attention']} 85%, transparent)`,
  'shortcut-destructive': `color-mix(${colorSchemeVars['color.content.shortcut-destructive']} 85%, transparent)`,
  'shortcut-soft': `color-mix(${colorSchemeVars['color.content.shortcut-soft']} 85%, transparent)`,
  'shortcut-transparent': `color-mix(${colorSchemeVars['color.content.shortcut-transparent']} 85%, transparent)`,
  'table.cell-even': colorSchemeVars['color.content.table.cell-even'],
  'table.cell-hover': colorSchemeVars['color.content.table.cell-hover'],
  'table.cell-odd': colorSchemeVars['color.content.table.cell-odd'],
  'table.header': colorSchemeVars['color.content.table.header'],
  tooltip: colorSchemeVars['color.content.tooltip']
} as const;

export const contain = ['layout', 'none'] as const;

export const containerType = ['inline-size', 'normal', 'size'] as const;

export const cursor = [
  'auto',
  'col-resize',
  'default',
  'e-resize',
  'ew-resize',
  'grab',
  'grabbing',
  'nesw-resize',
  'ns-resize',
  'nwse-resize',
  'pointer',
  'not-allowed',
  'progress',
  'text',
  'w-resize',
  'wait'
] as const;

export const display = [
  'block',
  'flex',
  'grid',
  'inline',
  'inline-block',
  'inline-flex',
  'none',
  'table-cell',
  'unset'
] as const;

export const flexBasis = {
  auto: 'auto',
  'fit-content': 'fit-content',
  fluid: '0%',
  full: '100%',
  'max-content': 'max-content',
  'min-content': 'min-content'
} as const;

export const flexDirection = ['column', 'column-reverse', 'row', 'row-reverse'] as const;

export const flexGrow = ['0', '1'] as const;

export const flexShrink = ['0', '1'] as const;

export const flexWrap = ['nowrap', 'wrap'] as const;

export const fontFamily = {
  inherit: 'inherit',
  regular: globalVars['font.family']
} as const;

export const fontSize = {
  body: globalVars['font.size.body'],
  'button.large': globalVars['font.size.button.large'],
  'command.description': globalVars['font.size.command.description'],
  'command.label': globalVars['font.size.command.label'],
  'button.small': globalVars['font.size.button.small'],
  'button.standard': globalVars['font.size.button.standard'],
  display: globalVars['font.size.display'],
  'field.description': globalVars['font.size.field.description'],
  'field.error': globalVars['font.size.field.error'],
  'field.label': globalVars['font.size.field.label'],
  'field.legend': globalVars['font.size.field.legend'],
  'heading.1': globalVars['font.size.heading.1'],
  'heading.2': globalVars['font.size.heading.2'],
  'heading.3': globalVars['font.size.heading.3'],
  'heading.4': globalVars['font.size.heading.4'],
  inherit: 'inherit',
  'input.text': globalVars['font.size.input.text'],
  'panel.header': globalVars['font.size.panel.header'],
  shortcut: globalVars['font.size.shortcut'],
  'table.cell': globalVars['font.size.table.cell'],
  'table.header': globalVars['font.size.table.header'],
  tooltip: globalVars['font.size.tooltip']
} as const;

export const fontWeight = {
  body: globalVars['font.weight.body'],
  button: globalVars['font.weight.button'],
  'command.description': globalVars['font.weight.command.description'],
  'command.label': globalVars['font.weight.command.label'],
  deemphasized: globalVars['font.weight.deemphasized'],
  display: globalVars['font.weight.display'],
  'field.description': globalVars['font.weight.field.description'],
  'field.error': globalVars['font.weight.field.error'],
  'field.label': globalVars['font.weight.field.label'],
  'field.legend': globalVars['font.weight.field.legend'],
  heading: globalVars['font.weight.heading'],
  inherit: 'inherit',
  input: globalVars['font.weight.input'],
  link: globalVars['font.weight.link'],
  'panel.header': globalVars['font.weight.panel.header'],
  shortcut: globalVars['font.weight.shortcut'],
  'table.cell': globalVars['font.weight.table.cell'],
  'table.header': globalVars['font.weight.table.header'],
  tooltip: globalVars['font.weight.tooltip']
} as const;

export const height = {
  ...spacing,
  auto: 'auto',
  'button.large': globalVars['height.button.large'],
  'button.small': globalVars['height.button.small'],
  'button.standard': globalVars['height.button.standard'],
  'canvas.handle': globalVars['size.canvas.handle'],
  'fit-content': 'fit-content',
  full: '100%',
  'max-content': 'max-content',
  'min-content': 'min-content',
  none: '0px',
  unset: 'unset',
  viewport: '100dvh'
} as const;

export const inset = {
  ...spacing,
  auto: 'auto',
  full: '100%',
  'full-negative': '-100%',
  half: '50%',
  sticky: '-1px'
} as const;

export const justifyContent = ['center', 'flex-end', 'flex-start', 'space-around', 'space-between', 'stretch'] as const;

export const letterSpacing = {
  body: globalVars['font.letter-spacing.body'],
  button: globalVars['font.letter-spacing.button'],
  display: globalVars['font.letter-spacing.display'],
  'field.description': globalVars['font.letter-spacing.field.description'],
  'field.error': globalVars['font.letter-spacing.field.error'],
  'field.label': globalVars['font.letter-spacing.field.label'],
  'field.legend': globalVars['font.letter-spacing.field.legend'],
  heading: globalVars['font.letter-spacing.heading'],
  inherit: 'inherit',
  input: globalVars['font.letter-spacing.input'],
  'panel.header': globalVars['font.letter-spacing.panel.header'],
  shortcut: globalVars['font.letter-spacing.shortcut'],
  'table.cell': globalVars['font.letter-spacing.table.cell'],
  'table.header': globalVars['font.letter-spacing.table.header'],
  tooltip: globalVars['font.letter-spacing.tooltip']
} as const;

export const lineHeight = {
  body: globalVars['font.line-height.body'],
  button: globalVars['font.line-height.button'],
  display: globalVars['font.line-height.display'],
  heading: globalVars['font.line-height.heading'],
  input: globalVars['font.line-height.input'],
  textarea: globalVars['font.line-height.textarea'],
  '0': '0',
  '1cap': '1cap',
  inherit: 'inherit'
} as const;

export const listStyleType = ['decimal', 'disc', 'none'] as const;

export const margin = {
  ...spacing,
  auto: 'auto'
} as const;

export const objectFit = ['contain', 'cover'] as const;

export const opacity = ['0', '1'] as const;

export const outlineColor = {
  'error-ring': colorSchemeVars['color.outline.error-ring'],
  'focus-ring': colorSchemeVars['color.outline.focus-ring'],
  transparent: 'transparent'
} as const;

export const outlineStyle = ['none', 'solid'] as const;

export const outlineWidth = {
  'error-ring': globalVars['outline.error-ring.width'],
  'focus-ring': globalVars['outline.focus-ring.width']
} as const;

export const overflow = ['auto', 'clip', 'hidden', 'scroll', 'visible'] as const;

export const overscrollBehavior = ['auto', 'none'] as const;

export const paddingInline = {
  ...spacing,
  unset: 'unset'
} as const;

export const paddingBlock = {
  ...spacing,
  unset: 'unset'
} as const;

export const pointerEvents = ['auto', 'none'] as const;

export const position = ['absolute', 'fixed', 'relative', 'static', 'sticky'] as const;

export const textAlign = ['left', 'center', 'right'] as const;

export const textDecoration = ['none', 'underline'] as const;

export const textOverflow = ['clip', 'ellipsis'] as const;

export const touchAction = ['auto', 'none'] as const;

export const transform = {
  'down-full': 'translateY(100%)',
  'icon-hover': 'scale(1.1)',
  'left-full': 'translateX(-100%)',
  none: 'none',
  popover: 'scale(0.975)',
  'right-full': 'translateX(100%)',
  'scale-0x': 'scale(0)',
  'up-full': 'translateY(-100%)'
} as const;

export const transitionDuration = {
  click: '60ms',
  long: globalVars['transition-duration.long'],
  medium: globalVars['transition-duration.medium'],
  none: '0ms',
  short: globalVars['transition-duration.short']
} as const;

export const transitionProperty = {
  'button-content': 'background-color, color, transform',
  'button-surface': 'background-color, box-shadow, transform',
  colors: 'background-color, color',
  link: 'background-size, color',
  opacity: 'opacity',
  'opacity-and-transform': 'opacity, transform',
  overlay: 'background-color, backdrop-filter',
  transform: 'transform'
} as const;

export const transitionTimingFunction = {
  'ease-in': globalVars['transition-timing-function.ease-in'],
  'ease-in-out': globalVars['transition-timing-function.ease-in-out'],
  'ease-out': globalVars['transition-timing-function.ease-out'],
  linear: globalVars['transition-timing-function.linear'],
  bounce: globalVars['transition-timing-function.bounce']
} as const;

export const userSelect = ['auto', 'none'] as const;

export const visibility = ['hidden', 'visible'] as const;

export const whiteSpace = ['nowrap', 'wrap'] as const;

export const wordBreak = ['break-word', 'break-all', 'normal'] as const;

export const width = {
  ...spacing,
  auto: 'auto',
  'canvas.handle': globalVars['size.canvas.handle'],
  'fit-content': 'fit-content',
  full: '100%',
  half: '50%',
  'max-content': 'max-content',
  'min-content': 'min-content',
  none: '0px',
  unset: 'unset',
  viewport: '100dvw'
} as const;

export const zIndex = ['1', '2', '3', 'auto'] as const;
