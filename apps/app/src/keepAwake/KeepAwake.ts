import videoUrl from './keepAwake.mp4?url';

/**
 * How the screen is kept on (0005): not yet (`off`, until a tap engages it; `starting` just after), by the Wake Lock API
 * (`wake-lock`, secure contexts only), by a silent looping video (`video`), or not at all
 * (`unavailable`), when the browser refused both.
 */
export type KeepAwakeMethod = 'off' | 'starting' | 'unavailable' | 'video' | 'wake-lock';

/**
 * Keeps the screen on, outside React. `engage()` must run in a user gesture (a tap), which browsers
 * ask for before they start it. Browsers release the lock and pause the video while the page is
 * hidden; both come back when it's shown again.
 */
export class KeepAwake {
  #listeners = new Set<() => void>();
  #method: KeepAwakeMethod = 'off';
  #sentinel: WakeLockSentinel | undefined;
  #video: HTMLVideoElement | undefined;

  getMethod = (): KeepAwakeMethod => this.#method;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);

    return () => this.#listeners.delete(listener);
  };

  /** Starts keeping the screen on. Call it from a tap; later calls do nothing. */
  engage = (): void => {
    if (this.#method !== 'off') {
      return;
    }

    this.#set('starting');
    document.addEventListener('visibilitychange', this.#recover);
    this.#acquire();
  };

  #acquire(): void {
    if (window.isSecureContext && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(
        sentinel => {
          this.#sentinel = sentinel;
          sentinel.addEventListener('release', this.#onRelease);
          this.#stopVideo();
          this.#set('wake-lock');
        },
        () => this.#playVideo()
      );
    } else {
      this.#playVideo();
    }
  }

  /**
   * Chrome keeps the screen on for a silent video only while most of it is in view and it covers a
   * fifth of the viewport, so the video covers the whole viewport, invisible and untouchable.
   */
  #playVideo(): void {
    if (!this.#video) {
      const video = document.createElement('video');

      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.src = videoUrl;
      Object.assign(video.style, {
        height: '100vh',
        inset: '0',
        opacity: '0',
        pointerEvents: 'none',
        position: 'fixed',
        width: '100vw',
        zIndex: '-1'
      });
      document.body.append(video);
      this.#video = video;
    }

    this.#video.play().then(
      () => this.#set('video'),
      () => this.#set('unavailable')
    );
  }

  #stopVideo(): void {
    this.#video?.pause();
  }

  #onRelease = (): void => {
    this.#sentinel = undefined;

    if (document.visibilityState === 'visible') {
      this.#acquire();
    }
  };

  #recover = (): void => {
    if (document.visibilityState === 'visible' && this.#sentinel === undefined) {
      this.#acquire();
    }
  };

  #set(method: KeepAwakeMethod): void {
    if (method !== this.#method) {
      this.#method = method;
      this.#listeners.forEach(listener => listener());
    }
  }
}
