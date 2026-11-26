import { createContext, use, useId, useState, type PropsWithChildren } from 'react';
import { toast as sonnerToast, Toaster } from 'sonner';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

/** As wide as the list on wide screens; on phones, sonner's own width for toasts takes over. */
const toastClass = designSystem({ width: 'full' });

/** How long a toast stays when `autoDismiss` is `true`, in milliseconds. */
const DEFAULT_DURATION = 5000;

export type ToastOptions = {
  /** A second, dimmed line. */
  description?: string | undefined;
  /** Shows a close button, and lets the toast be swiped away. */
  dismissible?: boolean | undefined;
  /**
   * Hides the toast by itself: after 5 seconds when `true` (the default), or after this many
   * milliseconds. `false` keeps it until it's dismissed, so only use that with `dismissible`.
   */
  autoDismiss?: boolean | number | undefined;
  /** Identifies the toast; showing one with the same id updates it. Defaults to the title. */
  id?: string | undefined;
};

type ToastViewProps = Pick<ToastOptions, 'description' | 'dismissible'> & {
  id: string | number;
  title: string;
};

/** A floating layer, so on the raised surface (0022). Rendered by sonner, which stacks and moves it. */
function ToastView({ description, dismissible = false, id, title }: ToastViewProps) {
  return (
    <Box
      alignItems='flex-start'
      backgroundColor='surface.raised'
      borderColor='line.strong'
      borderStyle='solid'
      borderWidth='hairline'
      color='text'
      display='flex'
      // Sonner sets a font of its own on the list it renders toasts in.
      fontFamily='regular'
      gap='3x'
      paddingBlock='3x'
      paddingInline='4x'
      width='full'
    >
      <Box flexGrow='1' minWidth='none' paddingBlock='2x'>
        <Stack spacing='2x'>
          <Text variant='body'>{title}</Text>
          {description ? (
            <Text color='text.dim' variant='body'>
              {description}
            </Text>
          ) : null}
        </Stack>
      </Box>
      {dismissible ? <IconButton icon='close' label='Dismiss' onClick={() => sonnerToast.dismiss(id)} /> : null}
    </Box>
  );
}

type ToastContextValue = {
  toasterId: string;
  /**
   * Sonner's id for each toast on screen, by our id. Showing a toast that's on screen updates it; one
   * that has gone, even if it's still sliding away, gets a fresh sonner id, or the new toast would
   * leave with the old one.
   */
  showing: Map<string, string>;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let created = 0;

/**
 * Shows toasts, stacked at the bottom of the screen; put it once around the app. Built on sonner
 * (0003), which only stacks, moves and times them: the toast itself is ours, as in Bonsai. Each
 * provider shows only its own toasts.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const toasterId = useId();
  const [showing] = useState(() => new Map<string, string>());

  return (
    <ToastContext value={{ showing, toasterId }}>
      {children}
      <Toaster
        id={toasterId}
        position='bottom-center'
        swipeDirections={['bottom', 'left', 'right']}
        toastOptions={{ className: toastClass, unstyled: true }}
        visibleToasts={3}
      />
    </ToastContext>
  );
}

/** Briefly tells the user something. Needs a `ToastProvider` around it. */
export function useToast() {
  const context = use(ToastContext);

  if (!context) {
    throw new Error('useToast needs a ToastProvider around it');
  }

  const { showing, toasterId } = context;

  return {
    show: (title: string, { autoDismiss = true, description, dismissible = false, id = title }: ToastOptions = {}) => {
      const sonnerId = showing.get(id) ?? `${id} ${++created}`;
      const forget = () => {
        if (showing.get(id) === sonnerId) {
          showing.delete(id);
        }
      };

      showing.set(id, sonnerId);
      sonnerToast.custom(
        toastId => <ToastView description={description} dismissible={dismissible} id={toastId} title={title} />,
        {
          dismissible,
          duration: autoDismiss === true ? DEFAULT_DURATION : autoDismiss === false ? Infinity : autoDismiss,
          id: sonnerId,
          onAutoClose: forget,
          onDismiss: forget,
          toasterId
        }
      );
    }
  };
}
