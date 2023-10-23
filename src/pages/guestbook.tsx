import { SiGithub, SiGithubHex, SiGoogle, SiGoogleHex } from '@icons-pack/react-simple-icons';
import { Avatar, Button, Divider, Input } from '@nextui-org/react';
import axios from 'axios';
import c from 'constant';
import { motion as m } from 'framer-motion';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import DefaultLayout from 'components/Layout/DefaultLayout';
import Link from 'components/Link';

import supabase from 'utils/client/supabase';
import { formatDate } from 'utils/dataFormatter';

import { APIResponse, State } from 'types/Common';
import { DbGuestbookCreate, DbGuestbookResponse } from 'types/Supabase';

const chatContainer = {
  hidden: {
    opacity: 1,
  },
  show: {
    opacity: 1,
    transition: {
      delay: c.ANIM_DELAY * 1,
      when: 'beforeChildren',
      staggerChildren: 0.125,
    },
  },
};
const chatItem = {
  hidden: {
    opacity: 0,
    y: '50%',
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
};
const chatItemMe = {
  hidden: {
    opacity: 0,
    x: '50%',
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
    },
  },
};

const defaultChats: DbGuestbookResponse = {
  id: 0,
  name: 'Arief Rachmawan',
  avatar: c.GITHUB_AVATAR as string,
  is_me: true,
  created_at: new Date('2023-10-18 13:20:09.205404+00').toISOString(),
  updated_at: new Date('2023-10-18 13:20:09.205404+00').toISOString(),
  message: `Hello! Thank you for visiting my page!
You can leave a message, question, or anything you want here.`,
};

interface GuestbookProps {
  chatsData: DbGuestbookResponse[];
}
export default function Guestbook(props: GuestbookProps) {
  const { data: session } = useSession();

  const [chatState, setChatState] = useState<State>('disabled');
  const [chatInput, setChatInput] = useState<string>('');
  const [chats, setChats] = useState<DbGuestbookResponse[]>(props.chatsData);
  const chatsRef = useRef<HTMLDivElement>(null);
  const recaptcha = useRef<ReCAPTCHA>();

  useEffect(() => {
    if (session?.user && chatInput.length > 0) {
      setChatState('idle');
    } else {
      setChatState('disabled');
    }
  }, [session, chatInput]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (chatsRef.current) {
        chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (chatsRef.current) {
      chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
    }
  }, [chats]);

  const handleSendChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChatState('loading');

    try {
      if (!recaptcha.current) throw new Error('Recaptcha is not initialized.');
      const token = await recaptcha.current.executeAsync();
      if (!token) throw new Error('Recaptcha token is not found.');

      if (!session || !session.user) throw new Error('You need to be logged in to leave a message.');

      const payload: DbGuestbookCreate = {
        name: session.user.name as string,
        message: chatInput,
        avatar: session.user.image ?? null,
      };

      const { data } = await axios
        .post<APIResponse<DbGuestbookResponse>>('/api/guestbook', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data);

      if (!data) throw new Error('Failed to send message. Check console for details.');

      toast.success('Message sent successfully!');
      setChatInput('');

      setChats((prev) => [...prev, data]);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to send message. Check console for details.');
    } finally {
      setChatState('idle');
    }
  };

  return (
    <DefaultLayout
      seo={{
        title: 'Guestbook',
      }}
    >
      {/* Header */}
      <div className='center-max-xl flex flex-col items-center justify-center gap-8'>
        <div className='flex w-full flex-col items-start'>
          <h1>Guestbook</h1>
          <m.span
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.75,
              ease: 'easeInOut',
              type: 'tween',
            }}
            className='text-small text-default-500'
          >
            Leave me a message!
          </m.span>
        </div>
      </div>
      <Divider />
      {/* Content */}
      <m.div
        variants={chatContainer}
        initial={'hidden'}
        animate={'show'}
        className='center-max-lg flex h-full flex-grow flex-col gap-4 rounded-medium'
      >
        {session ? (
          <div className='center-max-lg flex flex-col gap-2'>
            <span className='flex items-center gap-2 text-small'>
              Signed in as {session.user?.name} ・{' '}
              <Link
                as={'span'}
                className='cursor-pointer text-small'
                onPress={() => signOut()}
              >
                Sign out
              </Link>
            </span>
            <form
              className='flex items-start gap-2'
              onSubmit={handleSendChat}
            >
              <Input
                variant='faded'
                placeholder='Leave a message...'
                fullWidth
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                description={
                  <span>
                    Form are protected by reCAPTCHA and the Google{' '}
                    <Link
                      href='https://policies.google.com/privacy'
                      isExternal
                      className='text-tiny'
                    >
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link
                      href='https://policies.google.com/terms'
                      isExternal
                      className='text-tiny'
                    >
                      Terms of Service
                    </Link>{' '}
                    apply.
                  </span>
                }
              />
              <Button
                type='submit'
                isDisabled={chatState === 'disabled'}
                isLoading={chatState === 'loading'}
                isIconOnly
              >
                {chatState !== 'loading' && <Icon name='SendHorizontal' />}
              </Button>
            </form>
            <ReCAPTCHA
              ref={recaptcha as LegacyRef<ReCAPTCHA>}
              badge='inline'
              theme='dark'
              aria-hidden
              size='invisible'
              className='invisible h-1'
              sitekey={
                process.env.NODE_ENV === 'production'
                  ? (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string)
                  : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
              }
            />
          </div>
        ) : (
          <div className='center-max-lg flex flex-col items-center gap-4 md:flex-row'>
            <Button
              fullWidth
              size='lg'
              onPress={() => signIn('github')}
              startContent={<SiGithub />}
              style={{
                backgroundColor: SiGithubHex,
              }}
            >
              Login with Github
            </Button>
            <Button
              fullWidth
              size='lg'
              onPress={() => signIn('google')}
              startContent={<SiGoogle />}
              style={{
                backgroundColor: SiGoogleHex,
              }}
            >
              Login with Google
            </Button>
          </div>
        )}
        <Divider />
        <div
          ref={chatsRef}
          className='flex h-full flex-grow flex-col gap-4 overflow-x-hidden'
        >
          <Chat
            {...defaultChats}
            is_pinned
            compact
          />
          {chats.map((chat) => (
            <Chat
              key={chat.id}
              {...chat}
              compact
            />
          ))}
        </div>
      </m.div>
    </DefaultLayout>
  );
}

function Chat(props: DbGuestbookResponse & { is_pinned?: boolean; compact?: boolean }) {
  if (props.compact) {
    return (
      <m.div
        variants={chatItem}
        className={twMerge('flex items-start gap-4 px-2')}
      >
        <Avatar
          className='flex-shrink-0'
          size='sm'
          src={props.avatar as string}
          name={props.name}
          isBordered
        />
        <div className='flex flex-col gap-2 md:flex-row md:gap-4'>
          <div className='flex flex-col items-start'>
            <span
              className={twMerge(
                'flex items-center gap-2 whitespace-nowrap text-tiny',
                props.is_me ? 'text-primary' : 'text-default-500',
              )}
            >
              {props.name}
              <Icon
                name='Pin'
                size='xs'
                className={props.is_pinned ? 'text-foreground' : 'invisible'}
              />
            </span>
            <span className='mt-auto h-full whitespace-nowrap text-tiny text-default-400'>
              {formatDate(props.created_at, {
                hour: 'numeric',
                minute: 'numeric',
              })}
            </span>
          </div>
          <p className='flex-grow whitespace-pre-wrap break-words text-small'>{props.message}</p>
        </div>
      </m.div>
    );
  }

  return (
    <m.div
      variants={props.is_me ? chatItemMe : chatItem}
      className={twMerge('flex items-start gap-4 px-2', props.is_me ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row')}
    >
      <Avatar
        className='flex-shrink-0'
        classNames={{
          base: 'mt-2',
        }}
        src={
          props.is_me ? 'https://avatars.githubusercontent.com/u/62494292?v=4' : (props.avatar as string) ?? undefined
        }
        name={props.name}
        isBordered
      />
      <div className={twMerge('flex flex-grow flex-col', props.is_me && 'items-end')}>
        <span className={'flex items-center gap-2'}>
          <span className={twMerge('font-bold', props.is_me && 'text-primary')}>{props.name}</span>
          {props.is_pinned && <Icon name='Pin' />}
        </span>
        <div
          className={twMerge(
            'flex w-fit flex-col whitespace-pre-wrap rounded-medium bg-content2 p-2 px-4',
            props.is_me ? 'rounded-tr-none' : 'rounded-tl-none',
          )}
        >
          <p>{props.message}</p>

          <span className={'mt-2 text-end text-tiny text-default-400'}>
            {formatDate(props.created_at, {
              hour: 'numeric',
              minute: 'numeric',
            })}
          </span>
        </div>
      </div>
    </m.div>
  );
}

export async function getServerSideProps() {
  const chatsData = await supabase.from('guestbook').select('*').order('created_at', { ascending: false });
  if (chatsData.error) {
    throw new Error(chatsData.error.message);
  }

  return {
    props: {
      chatsData: chatsData.data,
    },
  };
}
