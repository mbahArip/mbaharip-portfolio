import axios from 'axios';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { ErrorToast, SuccessToast } from 'components/DetailedToast';

import supabase from 'utils/client/supabase';

import { State } from 'types/Common';

// Add more later
export interface SettingsContextProps {
  settingsState: State;
  isHireable: boolean;
  onHireableChange: (isHireable: boolean) => Promise<void>;
}
const SettingsContext = createContext<SettingsContextProps>({
  settingsState: 'loading',
  isHireable: false,
  onHireableChange: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: React.ReactNode;
}
export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { data: session } = useSession();
  const [settingsState, setSettingsState] = useState<State>('loading');
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

        const timeout = setTimeout(() => {
          setSettingsState('idle');
        }, 150);

        return () => {
          clearTimeout(timeout);
        };
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
    const toastId = 'settings-hireable';
    const prevStatus = hireable;

    toast.loading('Updating status...', {
      toastId,
      autoClose: false,
    });

    try {
      setHireable(isHireable);
      const res = await axios.put(
        '/api/admin/hireable',
        {
          hireable: String(isHireable),
        },
        {
          headers: {
            Authorization: session?.user?.email,
          },
        },
      );
      if (res.data.error) throw new Error(res.data.error);
      toast.update(toastId, {
        render: <SuccessToast message='Successfully update status' />,
        type: toast.TYPE.SUCCESS,
        autoClose: 1500,
        isLoading: false,
      });
    } catch (error: any) {
      console.error(error);
      toast.update(toastId, {
        render: (
          <ErrorToast
            message='Failed to update status'
            details={error.response.data.error || error.message}
          />
        ),
        type: toast.TYPE.ERROR,
        autoClose: 1500,
        isLoading: false,
      });
      setHireable(prevStatus);
    }
  };

  const val: SettingsContextProps = {
    settingsState,
    isHireable: hireable,
    onHireableChange,
  };

  return <SettingsContext.Provider value={val}>{children}</SettingsContext.Provider>;
};
