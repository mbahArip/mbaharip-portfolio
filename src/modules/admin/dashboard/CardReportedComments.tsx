import { Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';

import TableContent, { TableContentColumnProps, TableContentRowProps } from 'components/TableContent';

import { APIDashboardResponse } from '../../../pages/api/admin/dashboard';

interface CardReportedCommentsProps {
  data: APIDashboardResponse['latestReportData'];
  isLoading: boolean;
}
type Data = {
  id: string;
  name: string;
  reason: string;
  comment: {
    id: string;
  };
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
    key: 'reason',
    label: 'REASON',
  },
];

export default function mod_AdminDashboard_CardReportedComments({ data, isLoading }: CardReportedCommentsProps) {
  const contentRow: TableContentRowProps<Data>[] = [
    {
      key: 'name',
      render(item) {
        return <span className='font-semibold'>{item.name}</span>;
      },
    },
    {
      key: 'reason',
      render(item) {
        return <span className='line-clamp-1'>{item.reason}</span>;
      },
    },
  ];
  return (
    <Card className='col-span-2'>
      <CardHeader>
        <h5>Reported comments</h5>
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
              'aria-label': 'Latest reported comments table',
              'removeWrapper': true,
            }}
          />
        </Skeleton>
      </CardBody>
    </Card>
  );
}
