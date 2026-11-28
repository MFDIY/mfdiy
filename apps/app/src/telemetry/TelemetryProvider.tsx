import type { PressStatus, WidgetAction } from '@mfdiy/instruments';
import type { SignalValue } from '@mfdiy/schema';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type PropsWithChildren
} from 'react';

import { TelemetryStore, type Connection } from './TelemetryStore.js';

const TelemetryContext = createContext<TelemetryStore | undefined>(undefined);

function bridgeUrl(): string {
  return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
}

export function TelemetryProvider({ children }: PropsWithChildren) {
  const [store] = useState(() => new TelemetryStore(bridgeUrl()));

  useEffect(() => {
    store.start();

    return () => store.stop();
  }, [store]);

  return <TelemetryContext.Provider value={store}>{children}</TelemetryContext.Provider>;
}

export function useTelemetryStore(): TelemetryStore {
  const store = useContext(TelemetryContext);

  if (!store) {
    throw new Error('useTelemetryStore must be used inside <TelemetryProvider>.');
  }

  return store;
}

export function useConnection(): Connection {
  const store = useTelemetryStore();

  return useSyncExternalStore(store.subscribeConnection, store.getConnection);
}

/** Current values of the given signals; re-renders only when one of them changes. */
export function useSignalValues(ids: readonly string[]): readonly SignalValue[] {
  const store = useTelemetryStore();
  const key = ids.join('|');

  const subscribe = useCallback(
    (listener: () => void) => store.subscribeSignals(key === '' ? [] : key.split('|'), listener),
    [store, key]
  );

  return useSyncExternalStore(subscribe, () => store.selectValues(ids));
}

const STATUS_RESET_MS = 1200;

/** Wires a game action to a pressable widget, including pending / ok / failed feedback. */
export function useWidgetAction(actionId: string | undefined): WidgetAction | undefined {
  const store = useTelemetryStore();
  const connection = useConnection();
  const [status, setStatus] = useState<PressStatus>('idle');

  const definition = connection.hello?.actions.find(action => action.id === actionId);

  if (!actionId) {
    return undefined;
  }

  return {
    label: definition?.label ?? actionId,
    status,
    available: connection.status === 'open' && definition !== undefined,
    trigger: async () => {
      setStatus('pending');

      const outcome = await store.triggerAction(actionId);

      setStatus(outcome === 'ok' ? 'ok' : 'failed');
      setTimeout(() => setStatus('idle'), STATUS_RESET_MS);
    }
  };
}
