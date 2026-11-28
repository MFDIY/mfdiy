import { createContext, useContext, useEffect, useState, useSyncExternalStore, type PropsWithChildren } from 'react';

import { KeepAwake, type KeepAwakeMethod } from './KeepAwake.js';

const KeepAwakeContext = createContext<KeepAwake | undefined>(undefined);

/**
 * Keeps the screen on from the first tap or key press anywhere in the app (0005), so a profile
 * opened from the home page needs no tap to engage; one opened directly (a bookmark, the QR code,
 * a refresh) shows it.
 */
export function KeepAwakeProvider({ children }: PropsWithChildren) {
  const [keepAwake] = useState(() => new KeepAwake());

  useEffect(() => {
    const options = { capture: true, once: true } as const;

    document.addEventListener('click', keepAwake.engage, options);
    document.addEventListener('keydown', keepAwake.engage, options);

    return () => {
      document.removeEventListener('click', keepAwake.engage, options);
      document.removeEventListener('keydown', keepAwake.engage, options);
    };
  }, [keepAwake]);

  return <KeepAwakeContext.Provider value={keepAwake}>{children}</KeepAwakeContext.Provider>;
}

function useKeepAwakeStore(): KeepAwake {
  const keepAwake = useContext(KeepAwakeContext);

  if (!keepAwake) {
    throw new Error('useKeepAwake must be used inside <KeepAwakeProvider>.');
  }

  return keepAwake;
}

/** How the screen is kept on, and `engage`, to call from a tap (0005). */
export function useKeepAwake(): { engage: () => void; method: KeepAwakeMethod } {
  const keepAwake = useKeepAwakeStore();
  const method = useSyncExternalStore(keepAwake.subscribe, keepAwake.getMethod, () => 'off' as const);

  return { engage: keepAwake.engage, method };
}
