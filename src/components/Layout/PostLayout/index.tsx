import { Divider } from '@nextui-org/react';
import c from 'constant';
import { motion } from 'framer-motion';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { State } from 'types/Common';
import { DbBlogResponse, DbCommentResponse, DbProjectResponse, DbStuffResponse } from 'types/Supabase';

import PostLayoutCommentSection from './CommentSection';
import PostLayoutHeader from './Header';

interface PostLayoutProps {
  seo?: NextSeoProps;
  defaultState?: State;
  data: DbBlogResponse | DbProjectResponse | DbStuffResponse;
  type: 'blogs' | 'projects' | 'stuff';
  className?: string;
  children: React.ReactNode;
}

export default function PostLayout(props: PostLayoutProps) {
  const router = useRouter();

  const [pageState, setPageState] = useState<State>(props.defaultState ?? 'loading');

  const [comments, setComments] = useState<DbCommentResponse[]>(props.data.comments);

  useEffect(() => {
    if (props.defaultState === 'idle') return;
    /**
     * To be honest, I don't know what causing hydration error
     * But it seems fixed by delaying the content render
     */
    const timeout = setTimeout(() => {
      setPageState('idle');
    }, 50);

    return () => {
      clearTimeout(timeout);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setPageState('loading');
    };
    const handleRouteChangeComplete = () => {
      setPageState('idle');
    };
    const handleRouteChangeError = () => {
      setPageState('idle'); // Set page state to 'idle' on route change error
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router.events]);

  return (
    <>
      <NextSeo
        {...props.seo}
        openGraph={{
          ...props.seo?.openGraph,
          images: [
            {
              url: props.data.thumbnail_url,
              width: 1200,
              height: 630,
            },
            ...(props.seo?.openGraph?.images ?? []),
          ],
          article: {
            authors: ['Arief Rachmawan'],
            publishedTime: props.data.created_at,
            modifiedTime: props.data.updated_at,
            section: props.type.toUpperCase().substring(0, 1) + props.type.substring(1),
            tags: [
              ...('tags' in props.data ? props.data.stacks.map((tag) => tag.name) : []),
              ...('stacks' in props.data ? props.data.stacks.map((stack) => stack.name) : []),
            ],
          },
          type: 'article',
        }}
      />
      <div className='flex h-full min-h-screen w-full flex-col overflow-y-hidden'>
        {pageState === 'loading' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.25,
              ease: 'easeInOut',
              type: 'tween',
            }}
            key={'loading'}
            className='grid h-full w-full flex-grow place-items-center'
          >
            <video
              className='h-32 w-32'
              autoPlay
              loop
              muted
            >
              <source
                src='/loading.webm'
                type='video/webm'
              />
            </video>
          </motion.div>
        ) : (
          <>
            <PostLayoutHeader
              data={props.data}
              type={props.type}
              comments={comments.length}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{ duration: 0.5, ease: 'easeInOut', type: 'tween', delay: c.ANIM_DELAY * 3 }}
              id='site-content'
              className={twMerge(
                'center-max-xl z-20 flex w-full flex-grow flex-col gap-4 overflow-y-hidden px-2 md:px-4',
                props.className && props.className,
              )}
            >
              <Divider />
              {props.children}
              <Divider />
              <PostLayoutCommentSection
                post={{
                  id: props.data.id,
                  type: props.type,
                }}
                comments={comments}
                onCommentUpdate={(newData: DbCommentResponse) => {
                  setComments((prev) => [...prev, newData]);
                }}
              />
            </motion.div>
          </>
        )}
      </div>
    </>
  );
}
