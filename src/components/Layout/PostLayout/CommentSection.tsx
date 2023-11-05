import { SiGithub, SiGithubHex, SiGoogle, SiGoogleHex } from '@icons-pack/react-simple-icons';
import { Button } from '@nextui-org/react';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import Link from 'components/Link';
import MarkdownRender from 'components/MarkdownRender';

import createUserId from 'utils/createUserId';

import { APIResponse } from 'types/Common';
import { DbCommentCreate, DbCommentResponse } from 'types/Supabase';

import Comment, { CommentReply } from './Comment';
import CommentInput from './CommentInput';

interface PostLayoutCommentSectionProps {
  post: {
    id: string;
    type: 'projects' | 'blogs' | 'stuff';
  };
  comments: DbCommentResponse[];
  onCommentUpdate: (newData: DbCommentResponse) => void;
}
export default function PostLayoutCommentSection(props: PostLayoutCommentSectionProps) {
  const { data: session } = useSession();

  const [replyParent, setReplyParent] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState<CommentReply | null>(null);
  const [waitingForCaptcha, setWaitingForCaptcha] = useState<boolean>(false);
  const replyRef = useRef<HTMLDivElement>();
  const recaptchaRef = useRef<ReCAPTCHA>();

  useEffect(() => {
    if (!replyRef.current) return;

    const recaptchaTimeout = setTimeout(() => {
      recaptchaRef.current?.reset();
    }, 5000);

    return () => {
      clearTimeout(recaptchaTimeout);
    };
  }, [replyRef]);

  useEffect(() => {
    if (replyRef.current) {
      replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      replyRef.current.focus();
    }
  }, [replyRef, isReplying]);

  const handlePostComment = async (value: string) => {
    if (!session) throw new Error('You must be logged in to comment.');
    if (!recaptchaRef.current) throw new Error('reCAPTCHA is not ready.');
    const timeout = setTimeout(() => {
      setWaitingForCaptcha(true);
    }, 3000);

    const token = await recaptchaRef.current.executeAsync().catch((err) => {
      clearTimeout(timeout);
      setWaitingForCaptcha(false);
      throw new Error('Failed to get reCAPTCHA token.');
    });
    clearTimeout(timeout);
    setWaitingForCaptcha(false);
    if (!token) throw new Error('Failed to get reCAPTCHA token.');

    const markdownString = renderToString(<MarkdownRender isComments>{value}</MarkdownRender>);

    const payload: DbCommentCreate & {
      postId: string;
      is_prohibited: boolean;
      type: 'projects' | 'blogs' | 'stuff';
    } = {
      postId: props.post.id,
      type: props.post.type,
      user_id: createUserId(session) as string,
      user_name: session?.user?.name as string,
      user_avatar: session?.user?.image ?? null,
      content: value,
      parent_id: replyParent ?? null,
      reply_to: isReplying?.id ?? null,
      is_me:
        session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && session.user?.name === 'mbaharip' ? true : false,
      is_prohibited: markdownString.includes('comment-prohibited-identifier'),
    };

    const res = await axios
      .post<APIResponse<DbCommentResponse>>('/api/comments', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data);
    if (!res.data) throw new Error('Failed to post comment. Check console for more details.');

    props.onCommentUpdate(res.data);
    setReplyParent(null);
    setIsReplying(null);

    toast.success('Comment posted! Thank you for your feedback.');
  };

  return (
    <>
      {/* Comment Section Start */}
      <div className='center-max-xl flex flex-col justify-between md:flex-row md:items-end'>
        <div className='flex items-center gap-2'>
          <h5>Comments ({props.comments.length})</h5>
          {session && (
            <Button
              as={Link}
              href='#comment'
              variant='flat'
              size='sm'
              startContent={
                <Icon
                  name='Plus'
                  size='sm'
                />
              }
            >
              Add comment
            </Button>
          )}
        </div>

        {session ? (
          <div className='flex items-center gap-1 text-small'>
            <span>
              Commenting as{' '}
              <span
                className={twMerge(
                  'font-bold',
                  session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && 'text-success',
                )}
              >
                {session.user?.name}
              </span>
            </span>
            <span>・</span>
            <Link
              as={'span'}
              className='cursor-pointer text-small'
              onPress={() => signOut()}
            >
              Sign out
            </Link>
          </div>
        ) : (
          <Link
            href='#login'
            className='text-small'
          >
            Login
          </Link>
        )}
      </div>

      {/* Comments */}
      <div className='flex w-full flex-col gap-4'>
        {props.comments.length === 0 && (
          <span className='w-full py-8 text-center text-small'>
            There are no comments yet. Be the first to comment!
          </span>
        )}
        {props.comments.map((comment) => {
          // Ignore replies
          if (comment.parent_id) return null;
          const replyComments = props.comments.filter((reply) => reply.parent_id === comment.id);
          let renderReply = false;
          if (isReplying?.id === comment.id) renderReply = true;
          if (replyComments.find((reply) => reply.id === isReplying?.id)) renderReply = true;

          return (
            <div
              key={comment.id}
              className='flex w-full flex-col gap-2'
            >
              <Comment
                data={comment}
                className='bg-content2'
                onReplyButtonClick={() => {
                  setReplyParent(comment.id);
                  setIsReplying({
                    id: comment.id,
                    username: comment.user_name,
                  });
                }}
              />
              {replyComments.map((reply) => (
                <div
                  key={reply.id}
                  className={twMerge('flex h-fit w-full items-start gap-2 pl-4')}
                >
                  <Comment
                    data={reply}
                    reply={{
                      id: comment.id,
                      username: comment.user_name,
                    }}
                    className={'bg-content2/75'}
                    onReplyButtonClick={() => {
                      setReplyParent(comment.id);
                      setIsReplying({
                        id: reply.id,
                        username: reply.user_name,
                      });
                    }}
                  />
                </div>
              ))}

              {isReplying && renderReply && (
                <div
                  ref={replyRef as LegacyRef<HTMLDivElement>}
                  className='w-full py-2 pl-16'
                >
                  <CommentInput
                    handleSubmit={handlePostComment}
                    waitingCaptcha={waitingForCaptcha}
                    compact
                    replyTo={isReplying}
                    handleCancelReply={() => {
                      setReplyParent(null);
                      setIsReplying(null);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New comments */}
      {session ? (
        <CommentInput
          id='comment'
          waitingCaptcha={waitingForCaptcha}
          handleSubmit={handlePostComment}
        />
      ) : (
        <div
          id='login'
          className='grid grid-cols-1 gap-4 md:grid-cols-2'
        >
          <Button
            size='lg'
            fullWidth
            startContent={<SiGithub />}
            style={{
              backgroundColor: SiGithubHex,
            }}
            onPress={() => signIn('github')}
          >
            Login with GitHub
          </Button>
          <Button
            size='lg'
            fullWidth
            startContent={<SiGoogle />}
            style={{
              backgroundColor: SiGoogleHex,
            }}
            onPress={() => signIn('google')}
          >
            Login with Google
          </Button>
        </div>
      )}

      <ReCAPTCHA
        ref={recaptchaRef as LegacyRef<ReCAPTCHA>}
        badge='inline'
        theme='dark'
        aria-hidden
        size='invisible'
        className='invisible h-1'
        onErrored={() => {
          console.log('captcha error');
        }}
        sitekey={
          process.env.NODE_ENV === 'production'
            ? (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string)
            : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
        }
      />
    </>
  );
}
