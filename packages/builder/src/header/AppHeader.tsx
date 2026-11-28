import { Box, IconButton, Logomark, Toggletip } from '@mfdiy/ui/components';

/** How the screen is kept on (0005), as the header shows it. */
export const keepAwakeMethods = ['unavailable', 'video', 'wake-lock'] as const;

export type KeepAwakeMethod = (typeof keepAwakeMethods)[number];

const keepAwakeHints: Record<KeepAwakeMethod, { hint: string; label: string }> = {
  unavailable: {
    hint: 'This browser won’t keep the screen on. Turn off auto-lock in the device’s settings, or keep it awake while charging.',
    label: 'Screen may turn off'
  },
  video: {
    hint: 'Kept on by a silent video, which some devices ignore. For a screen that stays mounted, turning off auto-lock in the device’s settings is the surest.',
    label: 'Screen stays on'
  },
  'wake-lock': { hint: 'Kept on by the browser’s wake lock.', label: 'Screen stays on' }
};

export type AppHeaderProps = {
  /** The accent of the page shown, which the logomark takes. */
  accent?: string | undefined;
  /** How the screen is kept on, shown with a hint; leave it out until it's engaged (0005). */
  keepAwake?: KeepAwakeMethod | undefined;
  /** Shows the QR code another device can scan to open the app, or the profile shown (0004). */
  onConnect?: (() => void) | undefined;
  /** Opens the editor on the page shown. */
  onEdit?: (() => void) | undefined;
  /** Shows the MFD fullscreen; leave it out where the browser can't (0009). */
  onFullscreen?: (() => void) | undefined;
  /** Leads home from the logomark. */
  onHome?: (() => void) | undefined;
};

/**
 * The header on the home page and on a profile (0009): the same one row over a hairline as the
 * editor's (0008), with the logomark on the left, which leads home, and Connect a device (0004),
 * Edit and Fullscreen on the right, after how the screen is kept on (0005). It draws no hairline: what it's placed in does.
 */
export function AppHeader({ accent, keepAwake, onConnect, onEdit, onFullscreen, onHome }: AppHeaderProps) {
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
      {keepAwake ? (
        <Box alignItems='center' display='flex' flexShrink='0' height='control' justifyContent='center' width='control'>
          <Toggletip
            icon={keepAwake === 'unavailable' ? 'warning' : 'light_mode'}
            label={keepAwakeHints[keepAwake].label}
          >
            {keepAwakeHints[keepAwake].hint}
          </Toggletip>
        </Box>
      ) : null}
      {onConnect ? <IconButton icon='qr_code' label='Connect a device' onClick={onConnect} /> : null}
      {onEdit ? <IconButton icon='edit' label='Edit' onClick={onEdit} /> : null}
      {onFullscreen ? <IconButton icon='fullscreen' label='Fullscreen' onClick={onFullscreen} /> : null}
    </Box>
  );
}
