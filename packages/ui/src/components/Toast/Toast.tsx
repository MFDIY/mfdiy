import type { PropsWithChildren } from 'react';

import { Toast as BaseToast } from '@base-ui/react/toast';

import { designSystem } from '../../styles/design-system.js';
import { Text } from '../Text/Text.js';

import * as styles from './Toast.css.js';

/** How long a toast stays, in milliseconds. */
const TIMEOUT = 5000;

/** Bottom centre, above everything, and never in the way of what's under it. */
const viewportClass = designSystem({
  alignItems: 'center',
  bottom: '5x',
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: '2x',
  insetX: 'none',
  pointerEvents: 'none',
  position: 'fixed',
  zIndex: '3'
});

/** A floating layer, so on the raised surface (0022). */
const toastClass = [
  designSystem({
    backgroundColor: 'surface.raised',
    borderColor: 'line.strong',
    borderStyle: 'solid',
    borderWidth: 'hairline',
    color: 'text',
    maxWidth: 'full',
    paddingBlock: '3x',
    paddingInline: '4x',
    pointerEvents: 'auto'
  }),
  styles.toast
].join(' ');

function Toasts() {
  const { toasts } = BaseToast.useToastManager();

  return toasts.map(toast => (
    <BaseToast.Root className={toastClass} key={toast.id} toast={toast}>
      <BaseToast.Title render={<Text variant='body' />} />
    </BaseToast.Root>
  ));
}

/** Shows toasts; put it once around the app. Built on Base UI's Toast (0003). */
export function ToastProvider({ children }: PropsWithChildren) {
  return (
    <BaseToast.Provider timeout={TIMEOUT}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className={viewportClass}>
          <Toasts />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

/** Briefly tells the user something. The same message shown again replaces itself rather than stacking. */
export function useToast() {
  const manager = BaseToast.useToastManager();

  return {
    // The message is the id: adding it again updates the toast that's already there.
    show: (message: string) => {
      manager.add({ id: message, title: message });
    }
  };
}
