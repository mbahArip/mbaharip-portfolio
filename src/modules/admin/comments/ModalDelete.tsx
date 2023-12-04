import { Button, ModalBody, ModalFooter, ModalHeader } from '@nextui-org/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';

import { ErrorToast, SuccessToast } from 'components/DetailedToast';

import { State } from 'types/Common';
import { DbSchemaComment } from 'types/Supabase';

import toastConfig from 'config/toast';

interface AdminComments_ModalDeleteProps {
  data: DbSchemaComment;
  onClose: () => void;
  callback?: () => void;
}
export default function Mod_AdminComment_ModalDeleteProps({ data, onClose, callback }: AdminComments_ModalDeleteProps) {
  const { data: session } = useSession();

  const [btnState, setBtnState] = useState<State>('idle');

  const handleDelete = useCallback(async () => {
    const toastId = `comments-delete-${data.id}`;

    toast.loading('Deleting selected comments...', {
      toastId,
      autoClose: false,
    });
    setBtnState('loading');
    try {
      await axios.delete(`/api/admin/comments/${data.id}`, {
        headers: {
          Authorization: session?.user?.email,
        },
      });
      toast.update(toastId, {
        render: <SuccessToast message={`Successfully delete comment`} />,
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
            message='Failed to delete post'
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
      <ModalHeader>Delete comment</ModalHeader>
      <ModalBody>
        <span>
          Are you sure want to delete <b>{data.name}</b> comment?{' '}
          <span className='text-small text-danger'>This action cannot be undone.</span>
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
