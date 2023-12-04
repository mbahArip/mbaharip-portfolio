import { Button, ModalBody, ModalFooter, ModalHeader, User } from '@nextui-org/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';

import { ErrorToast, SuccessToast } from 'components/DetailedToast';
import Icon from 'components/Icons';
import TableContent, { TableContentColumnProps, TableContentRowProps } from 'components/TableContent';

import { formatDate } from 'utils/dataFormatter';

import { State } from 'types/Common';
import { DbSchemaComment } from 'types/Supabase';

import toastConfig from 'config/toast';

interface AdminComment_ModalDeleteSelectedProps {
  data: DbSchemaComment[];
  isLoading: boolean;
  onClose: () => void;
  callback?: () => void;
}
const contentColumns: TableContentColumnProps<DbSchemaComment>[] = [
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
export default function Mod_AdminComment_ModalViewSelected({
  data,
  isLoading,
  onClose,
  callback,
}: AdminComment_ModalDeleteSelectedProps) {
  const { data: session } = useSession();

  const [btnState, setBtnState] = useState<State>('idle');
  const contentRows: TableContentRowProps<DbSchemaComment>[] = [
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

  useEffect(() => {
    if (data.length > 1) setBtnState('idle');
    else setBtnState('disabled');
  }, [data]);

  const handleDelete = useCallback(async () => {
    const toastId = 'comments-delete-selected';

    toast.loading('Deleting selected comments...', {
      toastId,
      autoClose: false,
    });
    setBtnState('loading');
    try {
      const ids = data.map((comment) => comment.id);
      await axios.delete('/api/admin/comments', {
        data: {
          ids,
        },
        headers: {
          Authorization: session?.user?.email,
        },
      });
      toast.update(toastId, {
        render: <SuccessToast message={`Successfully deleted ${data.length} comments`} />,
        type: toast.TYPE.SUCCESS,
        autoClose: toastConfig.autoClose,
        delay: 150,
        isLoading: false,
      });
      onClose();
      mutate('/api/admin/comments');
      if (callback) callback();
    } catch (error: any) {
      console.error(error);
      toast.update(toastId, {
        render: (
          <ErrorToast
            message='Failed to delete selected comments'
            details={error.response.data.error || error.message}
          />
        ),
        type: toast.TYPE.ERROR,
        autoClose: toastConfig.autoClose,
        delay: 150,
        isLoading: false,
      });
      setBtnState('idle');
    }
  }, [callback, data, onClose, session?.user?.email]);

  return (
    <>
      <ModalHeader>Delete selected</ModalHeader>
      <ModalBody>
        <span>
          Are you sure you want to delete <b>{data.length}</b> selected comments?{' '}
          <span className='text-small text-danger'>This action cannot be undone.</span>
        </span>
        <TableContent
          columns={contentColumns}
          rows={contentRows}
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
        <span className='text-tiny text-default-500'>
          Only available when <b>2 or more</b> comments are selected.
        </span>
      </ModalBody>
      <ModalFooter>
        <Button
          variant='flat'
          color='default'
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          variant='shadow'
          color='danger'
          isDisabled={btnState === 'disabled'}
          isLoading={btnState === 'loading'}
          onPress={handleDelete}
        >
          Delete selected
        </Button>
      </ModalFooter>
    </>
  );
}
