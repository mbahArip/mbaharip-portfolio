import { createContext, useContext, useEffect, useState } from 'react';

import supabase from 'utils/client/supabase';

// Add more later
export interface SettingsContextProps {
  isHireable: boolean;
}
const SettingsContext = createContext<SettingsContextProps>({
  isHireable: false,
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: React.ReactNode;
}
export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<SettingsContextProps>({
    isHireable: false,
  });

  // assign settings
  useEffect(() => {
    supabase
      .from('settings')
      .select('*')
      .then(({ data }) => {
        if (!data?.length) return;

        const isHireable = data.find((d) => d.id === 'isHireable')?.value === 'true';

        setSettings({
          isHireable,
        });
      });

    // subscribe to settings
    const channel = supabase
      .channel('settings:update')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings',
        },
        (payload) => {
          if (payload.new.id === 'isHireable') {
            const isHireable = payload.new.value === 'true';
            setSettings((prev) => ({
              ...prev,
              isHireable,
            }));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
};
