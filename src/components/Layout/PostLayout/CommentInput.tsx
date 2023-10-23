import { Button, Textarea } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import Link from 'components/Link';

import { State } from 'types/Common';

import { CommentReply } from './Comment';

interface CommentInputProps {
  handleSubmit: (value: string) => Promise<void>;
  waitingCaptcha?: boolean;
  compact?: boolean;
  replyTo?: CommentReply;
  handleCancelReply?: () => void;
}
export default function CommentInput(props: CommentInputProps) {
  const [state, setState] = useState<State>('disabled');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (value.length > 0) {
      setState('idle');
    } else {
      setState('disabled');
    }
  }, [value]);

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('loading');
    try {
      await props.handleSubmit(value);
      setValue('');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to submit comment. Please try again later.');
    } finally {
      setState('idle');
    }
  };

  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={handleSubmitForm}
    >
      {props.replyTo && (
        <Button
          size='sm'
          variant='light'
          disableAnimation
          className='-mb-2 flex h-fit w-fit min-w-0 flex-wrap items-center justify-start gap-1 px-1 py-0.5 text-small'
          onPress={() => {
            const el = document.getElementById(props.replyTo?.id as string);

            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.focus();
              el.dataset.highlight = 'true';
            }
          }}
        >
          <span>Replying to</span>
          <span className='font-bold'>{props.replyTo.username}</span>
          <span className='text-tiny font-semibold text-default-400'>#{props.replyTo.id}</span>
        </Button>
      )}
      <Textarea
        size={props.compact ? 'sm' : 'md'}
        minRows={props.compact ? 3 : 5}
        placeholder='Write a comment...'
        className='w-full'
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        description={
          <div
            className={twMerge(
              'flex w-full flex-col items-start justify-between text-small lg:flex-row',
              props.compact && 'text-tiny',
            )}
          >
            <span>
              <Link
                href='https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#quoting-code'
                isExternal
                className={twMerge('text-small', props.compact && 'text-tiny')}
              >
                Code
              </Link>{' '}
              and{' '}
              <Link
                href='https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#links'
                isExternal
                className={twMerge('text-small', props.compact && 'text-tiny')}
              >
                Link
              </Link>{' '}
              will be rendered as Markdown.
            </span>
          </div>
        }
      />
      <Button
        size={props.compact ? 'sm' : 'md'}
        type='submit'
        color='secondary'
        variant='shadow'
        isDisabled={state === 'disabled'}
        isLoading={state === 'loading'}
      >
        {props.waitingCaptcha ? 'Waiting for reCAPTCHA...' : state === 'loading' ? 'Submitting...' : 'Submit Comment'}
      </Button>
      {props.replyTo && props.handleCancelReply && (
        <Button
          size={props.compact ? 'sm' : 'md'}
          type='button'
          color='danger'
          variant='light'
          onPress={props.handleCancelReply}
        >
          Cancel Reply
        </Button>
      )}
      <span className={twMerge('text-center', props.compact ? 'text-tiny' : 'text-small')}>
        Form are protected by reCAPTCHA and the Google{' '}
        <Link
          href='https://policies.google.com/privacy'
          isExternal
          className={twMerge('text-small', props.compact && 'text-tiny')}
        >
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link
          href='https://policies.google.com/terms'
          isExternal
          className={twMerge('text-small', props.compact && 'text-tiny')}
        >
          Terms of Service
        </Link>{' '}
        apply.
      </span>
    </form>
  );
}
