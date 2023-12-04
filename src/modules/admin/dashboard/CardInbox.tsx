import { Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';

import TableContent, { TableContentColumnProps, TableContentRowProps } from 'components/TableContent';

import { APIDashboardResponse } from '../../../pages/api/admin/dashboard';

interface CardInboxProps {
  data: APIDashboardResponse['latestMailData'];
  isLoading: boolean;
}
type Data = {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};
const tableColumn: TableContentColumnProps<Data>[] = [
  {
    key: 'name',
    label: 'NAME',
    width: 150,
  },
  {
    key: 'email',
    label: 'EMAIL',
    width: 250,
  },
  {
    key: 'content',
    label: 'CONTENT',
  },
];

export default function mod_AdminDashboard_CardInbox({ data, isLoading }: CardInboxProps) {
  const contentRow: TableContentRowProps<Data>[] = [
    {
      key: 'name',
      render(item) {
        return <span className='font-semibold'>{item.name}</span>;
      },
    },
    {
      key: 'email',
      render(item) {
        return <span className='text-default-500'>{item.email}</span>;
      },
    },
    {
      key: 'content',
      render(item) {
        return <span>{item.content}</span>;
      },
    },
  ];
  return (
    <Card className='col-span-4'>
      <CardHeader>
        <h5>Inbox</h5>
      </CardHeader>
      <CardBody>
        <Skeleton isLoaded={!isLoading}>
          <TableContent
            columns={tableColumn}
            rows={contentRow}
            items={data}
            emptyContent='Nothing to show'
            isLoading={isLoading}
            tableProps={{
              'aria-label': 'Unread inbox mails table',
              'removeWrapper': true,
            }}
          />
        </Skeleton>
      </CardBody>
    </Card>
  );
}
