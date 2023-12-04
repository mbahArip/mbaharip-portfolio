import { Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';

import { APIDashboardResponse } from '../../../pages/api/admin/dashboard';

interface CardTotalPostProps {
  data: APIDashboardResponse['totalPostsPerCategory'];
  isLoading: boolean;
}

export default function mod_AdminDashboard_CardTotalPost({ data, isLoading }: CardTotalPostProps) {
  return (
    <Card className='col-span-3'>
      <CardHeader>
        <h5>Total posts</h5>
      </CardHeader>
      <CardBody>
        <Skeleton isLoaded={!isLoading}>
          {Object.keys(data).length > 0 ? (
            <div
              className='grid w-full'
              style={{
                gridTemplateColumns: `repeat(${Object.keys(data).length}, minmax(0, 1fr))`,
              }}
            >
              {data.map((item) => (
                <div
                  key={item.id}
                  className='flex w-full flex-col gap-1'
                >
                  <span className='capitalize text-default-500'>{item.title}</span>
                  <h3>{item.count}</h3>
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
