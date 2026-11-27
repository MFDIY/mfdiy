import { Box, Text } from '@mfdiy/ui/components';

export type CanvasLabelProps = {
  /** The shape and grid, e.g. "16:10 · 24 × 15". */
  detail: string;
  onPress: () => void;
  /** Whether the profile's settings are showing. */
  pressed: boolean;
  /** The profile and the page, e.g. "Fighter · Flight". */
  title: string;
};

/**
 * Names what's on the canvas, above the page's top-left corner like an artboard's name (0006):
 * the profile and page, then the shape and grid. Pressing it shows the profile's settings.
 */
export function CanvasLabel({ detail, onPress, pressed, title }: CanvasLabelProps) {
  return (
    <Box
      appearance='none'
      aria-pressed={pressed}
      backgroundColor='transparent'
      borderStyle='hidden'
      color={{ default: pressed ? 'text' : 'text.dim', hover: 'text', active: 'text' }}
      cursor='pointer'
      display='block'
      maxWidth='full'
      onClick={onPress}
      outlineColor='focus'
      outlineStyle={{ default: 'none', focusVisible: 'solid' }}
      outlineWidth='focus'
      paddingBottom='2x'
      paddingInline='none'
      paddingTop='none'
      tagName='button'
      textAlign='left'
      type='button'
    >
      <Box display='block' tagName='span'>
        <Text tagName='span' truncate variant='label'>
          {title}
        </Text>
      </Box>
      <Box display='block' tagName='span'>
        <Text tagName='span' truncate variant='label'>
          {detail}
        </Text>
      </Box>
    </Box>
  );
}
