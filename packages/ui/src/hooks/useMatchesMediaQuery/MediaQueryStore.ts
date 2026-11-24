type DestroyCallback = () => void;

export class MediaQueryStore {
  #mql: MediaQueryList | undefined;
  #onDestroy: DestroyCallback;
  #query: string;
  #subscribers: number = 0;

  constructor(query: string, onDestroy: DestroyCallback) {
    this.#query = query;
    this.#onDestroy = onDestroy;
  }

  get mql(): MediaQueryList {
    if (typeof this.#mql !== 'undefined') return this.#mql;

    this.#mql = window.matchMedia(this.#query);

    return this.#mql;
  }

  getServerSnapshot = () => {
    /**
     * Always false, meaning the Media Query was not matched. Used for providing the same data
     * during SSR and hydration.
     */
    return false;
  };

  getSnapshot = () => {
    return this.mql.matches;
  };

  subscribe = (onStoreChange: () => void) => {
    this.#subscribers++;

    this.mql.addEventListener('change', onStoreChange);

    return () => {
      this.mql.removeEventListener('change', onStoreChange);
      this.#subscribers--;

      if (this.#subscribers === 0 && typeof this.#mql !== 'undefined') {
        this.#onDestroy();
        this.#mql = undefined;
      }
    };
  };
}
