import { Divider, Skeleton } from '@nextui-org/react';
import useSWR from 'swr';

import Icon from 'components/Icons';
import Link from 'components/Link';

import getNextUIColor from 'utils/nextui-color-var';

import AdminNavigationData from './navigation';

export default function NavigationList() {
  const count = useSWR('/api/admin/count');

  return (
    <div className='relative flex h-full w-full flex-col items-center gap-2'>
      {AdminNavigationData.map((item, index) => {
        if (item === 'gap') {
          return (
            <div
              key={`gap${index}`}
              className='my-4 w-full'
            />
          );
        }

        return (
          <div
            key={`item${index}`}
            className='relative flex w-full flex-col items-center'
          >
            <Link
              tooltip={item.description}
              tooltipProps={{
                placement: 'right',
                showArrow: true,
                offset: 0,
              }}
              color='foreground'
              href={item.href}
              key={item.name}
              className='flex w-full items-center gap-2'
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
              {count.data && Object.keys(count.data.data).includes(item.key) && (
                <Skeleton isLoaded={!count.isLoading && !count.isValidating}>
                  <span className='text-tiny text-default-500'>({count.data.data[item.key] || 0})</span>
                </Skeleton>
              )}
            </Link>
            <div className='flex w-full flex-col'>
              {item.children?.map((child, childIndex) => (
                <Link
                  tooltip={child.description}
                  tooltipProps={{
                    placement: 'right',
                    showArrow: true,
                    offset: 8,
                  }}
                  size='sm'
                  color='foreground'
                  href={child.href}
                  key={`item${index}-child${childIndex}`}
                  className='flex items-center pl-2'
                >
                  <Divider
                    orientation='vertical'
                    className='h-9'
                  />
                  <Divider className='mr-2 w-4' />
                  <div className='flex flex-grow items-center justify-between gap-2'>
                    <div
                      color='foreground'
                      className='flex w-full items-center gap-1 py-2'
                    >
                      <Icon
                        name={child.icon}
                        style={{
                          color: getNextUIColor(child.color ?? 'foreground'),
                        }}
                        size='sm'
                      />
                      <span>{child.name}</span>
                      {count.data && (
                        <Skeleton isLoaded={!count.isLoading && !count.isValidating}>
                          <span className='text-tiny text-default-500'>
                            ({count.data.data[child.key.split('/')[1]] || 0})
                          </span>
                        </Skeleton>
                      )}
                    </div>
                    {child.color && (
                      <div
                        className='h-2 w-2 rounded-full'
                        style={{
                          backgroundColor: getNextUIColor(child.color ?? 'foreground'),
                        }}
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
