import { Button, Skeleton, Tooltip, User } from '@nextui-org/react';
import { signOut, useSession } from 'next-auth/react';

import Icon from 'components/Icons';

import { useSettings } from 'contexts/settings';
import getNextUIColor from 'utils/nextui-color-var';

export default function UserArea() {
  const { data: session } = useSession();
  const settings = useSettings();

  return (
    <Skeleton
      isLoaded={settings.settingsState === 'idle'}
      className='w-full py-2'
    >
      <div className='flex w-full items-center justify-between gap-3'>
        <User
          name={
            <div className='flex items-center gap-1'>
              <span>{session?.user?.name ?? 'Unknown'}</span>
              <div
                className='h-2 w-2 rounded-full'
                style={{
                  backgroundColor: settings.isHireable ? getNextUIColor('success') : getNextUIColor('danger'),
                }}
              />
            </div>
          }
          description={session?.user?.email ?? 'Session expired'}
          avatarProps={{
            src: session?.user?.image ?? undefined,
            color: settings.isHireable ? 'success' : 'danger',
            size: 'sm',
          }}
        />
        <div className='flex items-center gap-1'>
          <Tooltip content={settings.isHireable ? 'Set as not hireable' : 'Set as hireable'}>
            <Button
              isIconOnly
              size='sm'
              variant='flat'
              onPress={() => {
                if (settings.onHireableChange) {
                  const currentStatus = settings.isHireable;
                  settings.onHireableChange(!currentStatus);
                }
              }}
            >
              <Icon name={settings.isHireable ? 'X' : 'Check'} />
            </Button>
          </Tooltip>
          <Tooltip content='User settings'>
            <Button
              isIconOnly
              size='sm'
              variant='flat'
            >
              <Icon name='UserCog' />
            </Button>
          </Tooltip>
          <Tooltip content='Logout'>
            <Button
              isIconOnly
              size='sm'
              variant='flat'
              color='danger'
              onPress={() => {
                signOut({
                  redirect: true,
                  callbackUrl: '/admin',
                });
              }}
            >
              <Icon name='LogOut' />
            </Button>
          </Tooltip>
        </div>
      </div>
    </Skeleton>
  );
}
