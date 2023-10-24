import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from '@nextui-org/react';
import axios from 'axios';
import c from 'constant';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import MarkdownRender from 'components/MarkdownRender';

import createUserId from 'utils/createUserId';
import { formatDate } from 'utils/dataFormatter';

import { State } from 'types/Common';
import { DbCommentResponse, DbReportCreate, DbRow } from 'types/Supabase';

export type CommentReply = {
  id: string;
  username: string;
};

interface CommentProps {
  data: DbCommentResponse;
  reply?: CommentReply;
  className?: string;
  onReplyButtonClick: (comment: DbCommentResponse) => void;
}
export default function Comment({ data, className, reply, onReplyButtonClick }: CommentProps) {
  const { data: session } = useSession();

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isCopyError, setIsCopyError] = useState<boolean>(false);

  const modal = useDisclosure();
  const [reportState, setReportState] = useState<State>('disabled');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (reason.length) {
      setReportState('idle');
    } else {
      setReportState('disabled');
    }
  }, [reason]);

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
    if (isCopyError) {
      const timeout = setTimeout(() => {
        setIsCopyError(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied, isCopyError]);

  const handleReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setReportState('loading');
    try {
      if (!session) throw new Error('You must be logged in to report a comment.');
      if (!reason.length) throw new Error('Reason cannot be empty.');
      if (!data.id) throw new Error('Comment ID is not found.');

      const payload: DbReportCreate = {
        comment_id: data.id,
        reason,
        reported_by: createUserId(session) as string,
      };

      await axios.post('/api/comments/report', payload).then((res) => res.data);

      setReason('');
      modal.onClose();

      toast.success('Comment reported successfully.');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to submit report. Please try again later.');
    } finally {
      setReportState('idle');
    }
  };

  return (
    <div className='flex w-full items-start gap-4'>
      <Avatar
        src={data.is_me ? c.GITHUB_AVATAR : data.user_avatar || undefined}
        name={data.user_name}
        size='sm'
        classNames={{
          base: 'mt-2',
        }}
      />
      <Card
        id={data.id}
        classNames={{
          base: twMerge(
            'flex-grow data-[highlight="true"]:ring-2 data-[highlight="true"]:ring-focus data-[highlight="true"]:ring-offset-0 data-[highlight="true"]:ring-offset-background',
            className,
          ),
          header: 'gap-0 pt-2 pb-0 md:gap-2 items-start md:items-center flex-col md:flex-row justify-between',
          body: 'px-3 py-0 gap-1 pt-2',
          footer: 'gap-1 flex-col-reverse items-start md:items-center md:flex-row',
        }}
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          (e.currentTarget as any).dataset.highlight = 'false';
        }}
      >
        <CardHeader>
          <span
            className={twMerge(
              'flex items-center gap-2 font-bold',
              data.is_me && 'text-success',
              data.user_id === createUserId(session) && !data.is_me && 'text-primary',
            )}
          >
            {data.user_name}{' '}
            {data.is_me && (
              <Chip
                color='success'
                variant='shadow'
                classNames={{
                  base: 'h-fit px-2 py-px gap-1',
                  content: 'text-tiny px-0 font-medium',
                }}
                startContent={
                  <Icon
                    name='CheckCircle'
                    size='xs'
                  />
                }
              >
                Author
              </Chip>
            )}
            {data.user_id === createUserId(session) && !data.is_me && <span className='text-tiny'>(You)</span>}
          </span>
          <span className='select-none text-tiny font-semibold text-default-400'>#{data.id}</span>
        </CardHeader>
        <CardBody>
          {data.reply_to && (data.reply_to as DbRow<'comments'>).id !== data.id && (
            <>
              <span className='flex items-center gap-1 text-tiny text-default-400'>
                Replying to{' '}
                <Chip
                  variant='light'
                  color='primary'
                  size='sm'
                  classNames={{
                    base: 'cursor-pointer h-fit px-0',
                    content: 'text-tiny px-0 font-semibold',
                  }}
                  endContent={
                    <Icon
                      name='ArrowRight'
                      size='xs'
                      className='ml-1'
                    />
                  }
                  onClick={async () => {
                    const el = document.getElementById((data.reply_to as DbRow<'comments'>).id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.focus();
                      el.dataset.highlight = 'true';
                    }
                  }}
                >
                  {(data.reply_to as DbRow<'comments'>).user_id === data.user_id
                    ? 'his/her own comment'
                    : (data.reply_to as DbRow<'comments'>).user_name}
                </Chip>
              </span>
            </>
          )}
          {data.reply_to && (
            <MarkdownRender isComments>{`> ${(data.reply_to as DbRow<'comments'>).content}`}</MarkdownRender>
          )}
          <MarkdownRender isComments>{data.content}</MarkdownRender>
        </CardBody>
        <CardFooter>
          <div className='flex items-center gap-1'>
            <Button
              size='sm'
              variant='light'
              disableAnimation
              isDisabled={!session}
              className='h-fit w-fit min-w-0 gap-1 px-1 py-0.5'
              startContent={
                <Icon
                  name={session ? 'Reply' : 'Ban'}
                  size='xs'
                />
              }
              onPress={() => {
                onReplyButtonClick(data);
              }}
            >
              {session ? 'Reply' : 'Login to reply'}
            </Button>
            <Button
              size='sm'
              variant='light'
              color={isCopied ? 'success' : isCopyError ? 'danger' : 'default'}
              disableAnimation
              className='h-fit w-fit min-w-0 gap-1 px-1 py-0.5'
              startContent={
                <Icon
                  name={isCopied ? 'Check' : isCopyError ? 'X' : 'Copy'}
                  size='xs'
                />
              }
              onClick={(e) => {
                if (isCopied || isCopyError) return;
                try {
                  const currentURL = new URL(window.location.href);
                  currentURL.hash = `#${data.id}`;
                  navigator.clipboard.writeText(currentURL.toString());

                  setIsCopied(true);
                } catch (error) {
                  console.error(error);
                  setIsCopyError(true);
                }
              }}
            >
              {isCopied ? 'Link copied' : isCopyError ? 'Failed to copy' : 'Copy comment link'}
            </Button>
            {session && data.user_id !== createUserId(session) && (
              <Button
                size='sm'
                variant='light'
                color={'danger'}
                disableAnimation
                className='h-fit w-fit min-w-0 gap-1 px-1 py-0.5'
                startContent={
                  <Icon
                    name='Flag'
                    size='xs'
                  />
                }
                onClick={(e) => {
                  modal.onOpen();
                }}
              >
                Report comment
              </Button>
            )}
          </div>
          <span className='text-tiny text-default-400'>
            {formatDate(data.created_at, {
              hour: 'numeric',
              minute: 'numeric',
            })}
          </span>
        </CardFooter>
      </Card>

      <Modal
        size='lg'
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
        onClose={() => {
          setReason('');
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <span className='font-bold text-danger'>Report comment</span>
              </ModalHeader>
              <form onSubmit={handleReport}>
                <ModalBody>
                  <div className='flex items-center gap-1 text-tiny'>
                    <span className='font-bold'>Your ID:</span>
                    <span className='text-default-500'>{createUserId(session)}</span>
                  </div>
                  <div className='flex items-center gap-1 text-tiny'>
                    <span className='font-bold'>Comment ID:</span>
                    <span className='text-default-500'>{data.id}</span>
                  </div>
                  <Textarea
                    label='Reason'
                    labelPlacement='outside'
                    isRequired
                    minRows={5}
                    placeholder='Reason for reporting this comment...'
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                    }}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant='light'
                    color='secondary'
                    onPress={() => {
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    variant='shadow'
                    color='danger'
                    isDisabled={reportState === 'disabled'}
                    isLoading={reportState === 'loading'}
                  >
                    Submit Report
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
Comment.defaultProps = {
  className: '',
  reply: undefined,
  onReplyButtonClick: () => {},
};
