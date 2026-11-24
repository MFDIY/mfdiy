import { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from 'react';

declare global {
  interface HTMLElementEventMap {
    intersect: CustomEvent<IntersectionObserverEntry>;
  }
}

const IntersectionObserverContext = createContext<IntersectionObserver | null>(null);

export type IntersectionObserverProviderProps = PropsWithChildren<{
  intersectionObserver: IntersectionObserver | null;
}>;

export const IntersectionObserverProvider = ({ children, intersectionObserver }: IntersectionObserverProviderProps) => {
  return (
    <IntersectionObserverContext.Provider value={intersectionObserver}>{children}</IntersectionObserverContext.Provider>
  );
};

type IntersectionObserverOptions = Pick<IntersectionObserverInit, 'rootMargin' | 'threshold'>;

/**
 * Creates an `IntersectionObserver` instance that watches the ref'd HTML element for intersections.
 */
export function useIntersectionObserver(options: IntersectionObserverOptions = {}) {
  /**
   * Store `IntersectionObserver` instance in state.
   */
  const [intersectionObserver, setIntersectionObserver] = useState<IntersectionObserver | null>(null);

  /**
   * Create an `IntersectionObserver` with the ref'd HTML element as its root when it mounts.
   * Destroy the `IntersectionObserver` instance when the ref'd HTML element unmounts.
   */
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (node === null && intersectionObserver !== null) {
        intersectionObserver.disconnect();
        setIntersectionObserver(null);
      }

      if (node !== null && intersectionObserver === null) {
        /**
         * Create an IntersectionObserverCallback function that dispatches a CustomEvent on the
         * observed elements.
         */
        const callback = (entries: IntersectionObserverEntry[]) => {
          entries.forEach(entry => {
            const event = new CustomEvent('intersect', { detail: entry });
            entry.target.dispatchEvent(event);
          });
        };

        /**
         * Observe intersections with the mounted node.
         */
        const defaultOptions = { root: node, threshold: [0, 1] };
        const observer = new IntersectionObserver(callback, { ...defaultOptions, ...options });
        setIntersectionObserver(observer);
      }
    },
    [intersectionObserver, options]
  );

  return [ref, intersectionObserver] as const;
}

/**
 * Executes a callback function whenever the ref'd HTML element intersects with the observed root
 * node configured in the IntersectionObserver from the nearest context provider.
 */
export function useIntersectionObservation(callback: (intersectionObserverEntry: IntersectionObserverEntry) => void) {
  /**
   * Get `IntersectionObserver` from nearest context provider.
   */
  const observer = useContext(IntersectionObserverContext);

  /**
   * Call callback function on observations.
   */
  const handleIntersectionObservation = useCallback(
    (event: CustomEvent<IntersectionObserverEntry>) => {
      callback(event.detail);
    },
    [callback]
  );

  /**
   * Track HTML element for event listening.
   */
  const ref = useRef<HTMLElement | null>(null);

  /**
   * Observe HTML element when it gets mounted. Unobserve HTML element when it gets unmounted.
   */
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      if (ref.current !== null) {
        observer?.unobserve(ref.current);
        ref.current.removeEventListener('intersect', handleIntersectionObservation);
      }

      if (node !== null) {
        node.addEventListener('intersect', handleIntersectionObservation);
        observer?.observe(node);
      }

      ref.current = node;
    },
    [handleIntersectionObservation, observer]
  );

  return setRef;
}
