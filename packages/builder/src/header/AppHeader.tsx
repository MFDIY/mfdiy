import { Box, IconButton, Logomark } from '@mfdiy/ui/components';

export type AppHeaderProps = {
  /** The accent of the page shown, which the logomark takes. */
  accent?: string | undefined;
  /** Opens the editor on the page shown; without it, there's no Edit. */
  onEdit?: (() => void) | undefined;
  /** Shows the MFD fullscreen; leave it out where the browser can't (0009). */
  onFullscreen?: (() => void) | undefined;
  /** Leads to the home page from the logomark; without it, as on the home page itself, the logomark is only a mark. */
  onHome?: (() => void) | undefined;
};

/**
 * The header on the home page and on a profile (0009): the same one row over a hairline as the
 * editor's (0008), with the logomark on the left, which leads home, and Edit and Fullscreen on the
 * right. It draws no hairline: what it's placed in does.
 */
export function AppHeader({ accent, onEdit, onFullscreen, onHome }: AppHeaderProps) {
  return (
    <Box
      alignItems='center'
      display='flex'
      height='control'
      paddingRight={{ default: 'none', 900: '3x' }}
      tagName='header'
    >
      {onHome ? (
        <Box
          alignItems='center'
          appearance='none'
          aria-label='All profiles'
          backgroundColor={{ default: 'transparent', hover: 'hover', active: 'pressed' }}
          borderStyle='hidden'
          display='flex'
          flexShrink='0'
          fontFamily='inherit'
          height='control'
          onClick={onHome}
          outlineColor='focus'
          outlineOffset='focus'
          outlineStyle={{ default: 'none', focusVisible: 'solid' }}
          outlineWidth='focus'
          padding='none'
          tagName='button'
          type='button'
        >
          <Logomark color={accent} />
        </Box>
      ) : (
        <Box alignItems='center' display='flex' flexShrink='0' height='control'>
          <Logomark color={accent} />
        </Box>
      )}
      <Box flexGrow='1' />
      {onEdit ? <IconButton icon='edit' label='Edit' onClick={onEdit} /> : null}
      {onFullscreen ? <IconButton icon='fullscreen' label='Fullscreen' onClick={onFullscreen} /> : null}
    </Box>
  );
}
