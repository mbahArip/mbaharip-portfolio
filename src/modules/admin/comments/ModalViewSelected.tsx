import { Button, ModalBody, ModalFooter, ModalHeader, User } from '@nextui-org/react';

import Icon from 'components/Icons';
import TableContent, { TableContentColumnProps, TableContentRowProps } from 'components/TableContent';

import { formatDate } from 'utils/dataFormatter';

import { DbSchemaComment } from 'types/Supabase';

interface AdminComments_ModalViewSelectedProps {
  data: DbSchemaComment[];
  isLoading: boolean;
  onClose: () => void;
}
const contentColumn: TableContentColumnProps<DbSchemaComment>[] = [
  {
    key: 'name',
    label: 'USER',
  },
  {
    key: 'content',
    label: 'COMMENT',
    width: 512,
  },
  {
    key: 'created_at',
    label: 'CREATED AT',
  },
];
export default function mod_AdminComment_ModalViewSelected({
  data,
  isLoading,
  onClose,
}: AdminComments_ModalViewSelectedProps) {
  const contentRow: TableContentRowProps<DbSchemaComment>[] = [
    {
      key: 'name',
      render(item) {
        return (
          <div className='flex items-center justify-between gap-8'>
            <User
              avatarProps={{ size: 'sm', src: item.avatar ?? undefined, name: item.name }}
              name={
                <div className='flex items-center gap-2'>
                  <span>{item.name}</span>
                  {item.is_flagged && (
                    <Icon
                      name='Flag'
                      className='fill-danger text-danger'
                      size='xs'
                      tooltip={'This comment is flagged, and will not be shown to other users.'}
                    />
                  )}
                </div>
              }
              description={item.user_id}
            />
            <div className='flex flex-col text-tiny text-default-500'>
              <div className='flex items-center gap-1'>
                <Icon
                  name='Flag'
                  size='xs'
                  tooltip='Reports on this comment'
                />
                <span>({item.reports || 0})</span>
              </div>
              <div className='flex items-center gap-1'>
                <Icon
                  name='Reply'
                  size='xs'
                  tooltip='Replies on this comment'
                />
                <span>({item.reply || 0})</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'content',
      render(item) {
        return <div>{item.content}</div>;
      },
    },
    {
      key: 'created_at',
      render(item) {
        return (
          <div>
            {formatDate(item.updated_at, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <ModalHeader>Selected comments</ModalHeader>
      <ModalBody>
        <TableContent
          columns={contentColumn}
          rows={contentRow}
          items={data}
          isLoading={isLoading}
          emptyContent={'No comments selected'}
          tableProps={{
            'aria-label': 'Selected comments',
            'removeWrapper': true,
            'isHeaderSticky': true,
            'classNames': {
              base: 'max-h-[480px] overflow-y-auto',
            },
          }}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          variant='flat'
          color='default'
          onPress={onClose}
        >
          Close
        </Button>
      </ModalFooter>
    </>
  );
}
