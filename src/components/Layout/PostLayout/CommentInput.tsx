import { Button, Divider, Popover, PopoverContent, PopoverTrigger, Textarea } from '@nextui-org/react';
import { icons } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import Link from 'components/Link';

import { State } from 'types/Common';

import { CommentReply } from './Comment';

const formatting: ({ icon: keyof typeof icons; title: string; description: string } | 'divider')[] = [
  {
    icon: 'Bold',
    title: 'Bold text',
    description: 'Example: **bold text**',
  },
  {
    icon: 'Italic',
    title: 'Italic text',
    description: 'Example: _italic text_',
  },
  {
    icon: 'Strikethrough',
    title: 'Strikethrough text',
    description: 'Example: ~strikethrough text~',
  },
  'divider',
  {
    icon: 'Code2',
    title: 'Code',
    description: 'Example: ```code```',
  },
  {
    icon: 'Code',
    title: 'Snippet',
    description: 'Example: `snippet`',
  },
  {
    icon: 'Link',
    title: 'Link',
    description: 'Example: [Google](https://www.google.com)',
  },
];

interface CommentInputProps {
  id?: string;
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
      id={props.id}
      className='flex flex-col gap-2 rounded-large border-medium border-divider p-1 px-2'
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
        size='sm'
        minRows={props.compact ? 3 : 5}
        placeholder='Write a comment (Markdown supported)'
        className='w-full'
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />

      <Popover
        showArrow
        placement='top'
        size='sm'
        classNames={{
          base: 'max-w-sm',
          trigger: twMerge(props.compact ? 'text-tiny' : 'text-small'),
        }}
      >
        <PopoverTrigger>
          <span className={twMerge('w-fit cursor-pointer text-primary')}>Formatting help</span>
        </PopoverTrigger>
        <PopoverContent>
          {formatting.map((format, index) => {
            if (format === 'divider')
              return (
                <Divider
                  key={index}
                  className='my-2'
                />
              );

            return (
              <div
                key={index}
                className='flex w-full items-center gap-4 py-1'
              >
                <Icon
                  name={format.icon}
                  size={props.compact ? 'md' : 'lg'}
                />
                <div className='flex flex-grow flex-col'>
                  <span className='font-semibold'>{format.title}</span>
                  <span className='text-tiny text-default-500'>{format.description}</span>
                </div>
              </div>
            );
          })}
          <span className='w-full pt-4 text-tiny text-default-500'>
            Learn more about{' '}
            <Link
              href='https://www.markdownguide.org/basic-syntax/'
              isExternal
              showAnchorIcon
              className='text-tiny'
            >
              Markdown syntax
            </Link>
          </span>
        </PopoverContent>
      </Popover>
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
