import { useSyncExternalStore } from 'react';

type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
};

type WebkitElement = HTMLElement & { webkitRequestFullscreen?: () => void };

/** Whether the browser can show the page fullscreen; Safari on an iPhone can't (0009). */
export function canFullscreen(): boolean {
  const webkit = document as WebkitDocument;

  return document.fullscreenEnabled || webkit.webkitFullscreenEnabled === true;
}

export function enterFullscreen(): void {
  const root = document.documentElement as WebkitElement;

  if (root.requestFullscreen) {
    void root.requestFullscreen().catch(() => undefined);
  } else {
    root.webkitRequestFullscreen?.();
  }
}

function subscribe(listener: () => void) {
  document.addEventListener('fullscreenchange', listener);
  document.addEventListener('webkitfullscreenchange', listener);

  return () => {
    document.removeEventListener('fullscreenchange', listener);
    document.removeEventListener('webkitfullscreenchange', listener);
  };
}

function isFullscreen(): boolean {
  return (document.fullscreenElement ?? (document as WebkitDocument).webkitFullscreenElement ?? null) !== null;
}

/** Whether the page is shown fullscreen (0009). */
export function useFullscreen(): boolean {
  return useSyncExternalStore(subscribe, isFullscreen, () => false);
}
