import axios from 'axios';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import supabase from 'utils/client/supabase';

// Add more later
export interface SettingsContextProps {
  isHireable: boolean;
  onHireableChange?: (isHireable: boolean) => Promise<void>;
}
const SettingsContext = createContext<SettingsContextProps>({
  isHireable: false,
  onHireableChange: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: React.ReactNode;
}
export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { data: session } = useSession();
  const [hireable, setHireable] = useState<boolean>(false);

  // assign settings
  useEffect(() => {
    supabase
      .from('settings')
      .select('*')
      .then(({ data }) => {
        if (!data?.length) return;

        const isHireable = data.find((d) => d.id === 'isHireable')?.value === 'true';

        setHireable(isHireable);
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
            setHireable(isHireable);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onHireableChange = async (isHireable: boolean) => {
    const prevStatus = hireable;
    try {
      setHireable(isHireable);
      const res = await axios.post(
        '/api/profile/status',
        {
          isHireable: String(isHireable),
        },
        {
          headers: {
            Authorization: session?.user?.email,
          },
        },
      );
      if (res.data.error) throw new Error(res.data.error);
      toast.success('Status updated');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to update status');
      setHireable(prevStatus);
    }
  };

  const val: SettingsContextProps = {
    isHireable: hireable,
    onHireableChange,
  };

  return <SettingsContext.Provider value={val}>{children}</SettingsContext.Provider>;
};
