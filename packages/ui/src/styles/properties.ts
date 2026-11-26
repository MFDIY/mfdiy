import { uiVars as v } from './vars.css.js';

/*
 * The values every style prop accepts. Token-valued props only offer the interface's vocabulary
 * (0022); anything else is a fixed list. Fewer values here means less generated CSS and faster
 * type checks, so only add what a component needs.
 */

export const spacing = {
  '1x': v['spacing.1x'],
  '2x': v['spacing.2x'],
  '3x': v['spacing.3x'],
  '4x': v['spacing.4x'],
  '5x': v['spacing.5x'],
  '6x': v['spacing.6x'],
  '7x': v['spacing.7x'],
  '8x': v['spacing.8x'],
  none: v['spacing.none']
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

/* ---------------- Colour ---------------- */

export const backgroundColor = {
  surface: v['surface'],
  'surface.raised': v['surface.raised'],
  backdrop: v['backdrop'],
  accent: v['accent'],
  'accent.hover': v['accent.hover'],
  'accent.pressed': v['accent.pressed'],
  hover: v['hover'],
  pressed: v['pressed'],
  'status.critical': v['status.critical'],
  'critical.hover': v['critical.hover'],
  'critical.pressed': v['critical.pressed'],
  'canvas.ghost': v['canvas.ghost'],
  'canvas.handle': v['canvas.handle'],
  transparent: 'transparent'
} as const;

export const backgroundImage = {
  /** A dot on every corner of the tile, so `backgroundSize` should be the size of one cell. */
  'canvas.dots': ['0 0', '100% 0', '0 100%', '100% 100%']
    .map(corner => `radial-gradient(circle at ${corner}, ${v['canvas.dot']} 1.5px, transparent 2px)`)
    .join(', '),
  'canvas.overlap': `repeating-linear-gradient(45deg, ${v['canvas.overlap.fill']} 0 6px, transparent 6px 12px)`
} as const;

export const backgroundRepeat = ['no-repeat'] as const;

export const borderColor = {
  line: v['line'],
  'line.strong': v['line.strong'],
  accent: v['accent'],
  'accent.hover': v['accent.hover'],
  'accent.pressed': v['accent.pressed'],
  focus: v['focus'],
  'status.critical': v['status.critical'],
  'canvas.edit': v['canvas.edit'],
  'canvas.overlap': v['canvas.overlap'],
  transparent: 'transparent'
} as const;

export const boxShadow = {
  'focus.glow': v['focus.glow'],
  'canvas.halo': v['canvas.halo'],
  'canvas.selected': v['canvas.selected'],
  none: 'none'
} as const;

export const color = {
  text: v['text'],
  'text.dim': v['text.dim'],
  'text.faint': v['text.faint'],
  accent: v['accent'],
  'accent.text': v['accent.text'],
  'status.warning': v['status.warning'],
  'status.critical': v['status.critical'],
  'status.critical.text': v['status.critical.text'],
  'canvas.edit': v['canvas.edit'],
  inherit: 'inherit'
} as const;

export const outlineColor = {
  focus: v['focus'],
  'status.critical': v['status.critical'],
  transparent: 'transparent'
} as const;

export const outlineStyle = ['none', 'solid'] as const;

export const outlineWidth = {
  focus: v['focus.width']
} as const;

export const outlineOffset = {
  focus: v['focus.offset'],
  none: '0px'
} as const;

/* ---------------- Borders ---------------- */

export const borderStyle = ['dashed', 'hidden', 'solid'] as const;

export const borderWidth = {
  hairline: v['border.hairline'],
  edit: v['border.edit'],
  none: '0px'
} as const;

/** Square by default (0022); `full` makes pills and dots. */
export const borderRadius = {
  none: '0px',
  full: '9999px'
} as const;

/* ---------------- Type ---------------- */

export const fontFamily = {
  inherit: 'inherit',
  regular: v['font']
} as const;

export const fontSize = {
  label: v['font.size.label'],
  body: v['font.size.body'],
  value: v['font.size.value'],
  heading: v['font.size.heading'],
  inherit: 'inherit'
} as const;

export const fontWeight = {
  regular: v['font.weight.regular'],
  bold: v['font.weight.bold'],
  inherit: 'inherit'
} as const;

export const letterSpacing = {
  label: v['tracking.label'],
  none: '0',
  inherit: 'inherit'
} as const;

export const lineHeight = {
  body: v['line-height.body'],
  heading: v['line-height.heading'],
  '0': '0',
  '1cap': '1cap',
  inherit: 'inherit'
} as const;

export const textTransform = ['none', 'uppercase'] as const;

/* ---------------- Layout ---------------- */

export const alignItems = ['center', 'flex-end', 'flex-start', 'stretch'] as const;

export const alignSelf = ['center', 'flex-end', 'flex-start', 'stretch'] as const;

export const appearance = ['auto', 'none', 'unset'] as const;

export const backdropFilter = {
  blur: 'blur(3px)',
  none: 'none'
};

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

export const height = {
  ...spacing,
  auto: 'auto',
  control: v['size.control'],
  'canvas.handle': v['size.canvas.handle'],
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

export const listStyleType = ['decimal', 'disc', 'none'] as const;

export const margin = {
  ...spacing,
  auto: 'auto'
} as const;

export const objectFit = ['contain', 'cover'] as const;

export const opacity = ['0', '1'] as const;

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
  'left-full': 'translateX(-100%)',
  none: 'none',
  popover: 'scale(0.975)',
  'right-full': 'translateX(100%)',
  'scale-0x': 'scale(0)',
  'up-full': 'translateY(-100%)'
} as const;

export const transitionDuration = {
  click: v['duration.click'],
  long: v['duration.long'],
  none: '0ms',
  short: v['duration.short']
} as const;

export const transitionProperty = {
  'button-content': 'background-color, color, transform',
  'button-surface': 'background-color, border-color, color, transform',
  colors: 'background-color, border-color, color',
  opacity: 'opacity',
  'opacity-and-transform': 'opacity, transform',
  overlay: 'background-color, backdrop-filter',
  transform: 'transform'
} as const;

export const transitionTimingFunction = {
  'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
  'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
  linear: 'linear'
} as const;

export const userSelect = ['auto', 'none'] as const;

export const visibility = ['hidden', 'visible'] as const;

export const whiteSpace = ['nowrap', 'wrap'] as const;

export const wordBreak = ['break-word', 'break-all', 'normal'] as const;

export const width = {
  ...spacing,
  auto: 'auto',
  'canvas.handle': v['size.canvas.handle'],
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
