import { Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';

import Link from 'components/Link';
import TableContent, { TableContentColumnProps, TableContentRowProps } from 'components/TableContent';

import { createPostUrl } from 'utils/parser';

import { APIDashboardResponse } from '../../../pages/api/admin/dashboard';

interface CardLatestCommentsProps {
  data: APIDashboardResponse['latestCommentsData'];
  isLoading: boolean;
}
type Data = {
  id: string;
  name: string;
  content: string;
  post: {
    id: string;
    title: string;
    category: string | null;
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
    key: 'content',
    label: 'COMMENT',
  },
  {
    key: 'post',
    label: 'POST',
    width: 320,
  },
];

export default function mod_AdminDashboard_CardLatestComments({ data, isLoading }: CardLatestCommentsProps) {
  const contentRow: TableContentRowProps<Data>[] = [
    {
      key: 'name',
      render(item) {
        return <span className='font-semibold'>{item.name}</span>;
      },
    },
    {
      key: 'content',
      render(item) {
        return <span className='line-clamp-1'>{item.content}</span>;
      },
    },
    {
      key: 'post',
      render(item) {
        const safeURL = createPostUrl(item.post.title, item.post.id);
        return (
          <Link
            color='primary'
            href={`/${item.post.category || 'uncategorized'}/posts/${safeURL}`}
          >
            {item.post.title}
          </Link>
        );
      },
    },
  ];
  return (
    <Card className='col-span-2'>
      <CardHeader>
        <h5>Comments</h5>
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
              'aria-label': 'Latest comments table',
              'removeWrapper': true,
            }}
          />
        </Skeleton>
      </CardBody>
    </Card>
  );
}
