import { createContext, useContext, type PropsWithChildren } from 'react';

import { useMatchesMediaQuery } from '../../hooks/useMatchesMediaQuery/useMatchesMediaQuery.js';

export type Preferences = {
  prefersReducedMotion: boolean;
};

const PreferencesContext = createContext<Preferences>({
  prefersReducedMotion: false
});

export type PreferencesProviderProps = PropsWithChildren;

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const prefersReducedMotion = useMatchesMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <PreferencesContext.Provider
      value={{
        prefersReducedMotion
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
