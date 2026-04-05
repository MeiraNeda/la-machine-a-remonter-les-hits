// src/context/DataRefreshContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const DataRefreshContext = createContext();

export function DataRefreshProvider({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Fonction de rafraîchissement avec debounce léger (évite spam)
  const triggerRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshTime > 500) { // anti-spam 500ms
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(now);
      console.log('Rafraîchissement global déclenché');
    }
  }, [lastRefreshTime]);

  return (
    <DataRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DataRefreshContext.Provider>
  );
}

export const useDataRefresh = () => useContext(DataRefreshContext);