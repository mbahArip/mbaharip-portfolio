import { Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';

import { APIDashboardResponse } from '../../../pages/api/admin/dashboard';

interface CardPostsRankProps {
  data: APIDashboardResponse['postsRankData'];
  isLoading: boolean;
}

export default function mod_AdminDashboard_CardPostsRank({ data, isLoading }: CardPostsRankProps) {
  return (
    <Card>
      <CardHeader>
        <h5>Posts rank</h5>
      </CardHeader>
      <CardBody>
        <Skeleton isLoaded={!isLoading}>
          {Object.keys(data).length > 0 ? (
            <div className='flex w-full flex-col'>
              <div className='flex flex-col gap-1'>
                {data.map((item, index) => (
                  <div
                    key={item.id}
                    className='flex w-full items-center justify-between gap-3'
                  >
                    <div className='line-clamp-1 flex flex-grow items-center gap-1'>
                      <span className='text-default-500'>{index + 1}.</span>
                      <span>{item.title}</span>
                    </div>
                    <span className='flex shrink-0 items-center gap-1 text-large font-semibold'>
                      {item.views} <span className='text-small text-default-500'>views</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <span>Nothing to show</span>
          )}
        </Skeleton>
      </CardBody>
    </Card>
  );
}
