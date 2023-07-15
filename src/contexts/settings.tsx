import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Settings } from 'types/api';

const initialSettings: Settings = {
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isMaintenance: false,
  workingOn: [],
};
const SettingsContext = createContext<Settings>(initialSettings);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: Settings;
}) => {
  const [webSettings, setWebSettings] = useState<Settings>(initialSettings);

  useEffect(() => {
    setWebSettings(value);
  }, [value]);

  return (
    <SettingsContext.Provider value={webSettings}>
      {children}
    </SettingsContext.Provider>
  );
};
