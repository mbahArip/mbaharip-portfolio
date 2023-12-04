import { Card, CardBody, CardHeader, Image, Skeleton } from '@nextui-org/react';

import Link from 'components/Link';

import { APIDashboardResponse } from '../../../pages/api/admin/dashboard';

interface LatestAttachmentsProps {
  data: APIDashboardResponse['latestAttachmentsData'];
  isLoading: boolean;
}

export default function mod_AdminDashboard_LatestAttachments({ data, isLoading }: LatestAttachmentsProps) {
  return (
    <Card className='col-span-3'>
      <CardHeader>
        <h5>Latest attachments</h5>
      </CardHeader>
      <CardBody>
        <Skeleton isLoaded={!isLoading}>
          {Object.keys(data).length > 0 ? (
            <div className='grid w-full grid-cols-5'>
              {data.map((item) => (
                <Link
                  key={item.id}
                  color='foreground'
                  href={`/admin/media/${item.id}`}
                >
                  <div className='group/img relative flex gap-1'>
                    <Image
                      src={item.url}
                      alt={item.name}
                      radius='none'
                      className='aspect-square h-full w-full object-cover'
                    />
                    <div className='absolute bottom-0 left-0 z-10 flex h-full w-full items-end bg-gradient-to-t from-content1 to-transparent p-2 opacity-0 transition group-hover/img:opacity-100'>
                      <span className='text-tiny'>{item.name}</span>
                    </div>
                  </div>
                </Link>
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
