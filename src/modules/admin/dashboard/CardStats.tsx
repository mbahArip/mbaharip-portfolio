import { Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';

import { APIDashboardResponse } from '../../../pages/api/admin/dashboard';

interface CardStatsProps {
  data: APIDashboardResponse['statsData'];
  isLoading: boolean;
}

export default function mod_AdminDashboard_CardStats({ data, isLoading }: CardStatsProps) {
  return (
    <Card>
      <CardHeader>
        <h5>Stats</h5>
      </CardHeader>
      <CardBody>
        <Skeleton isLoaded={!isLoading}>
          {Object.keys(data).length > 0 ? (
            <div className='flex w-full flex-col'>
              {Object.entries(data).map(([k, v]) => (
                <div
                  key={k}
                  className='flex w-full items-center justify-between gap-1'
                >
                  <span className='capitalize'>{k}</span>
                  <span className='flex shrink-0 items-center gap-1 text-large font-semibold'>
                    {v} <span className='text-small text-default-500'>posts</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span>Nothing to show</span>
          )}
        </Skeleton>
      </CardBody>
    </Card>
  );
}
