import { motion } from 'framer-motion';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { State } from 'types/Common';

interface DefaultLayoutProps {
  seo?: NextSeoProps;
  defaultState?: State;
  className?: string;
  children: React.ReactNode;
}

export default function DefaultLayout(props: DefaultLayoutProps) {
  const router = useRouter();

  const [pageState, setPageState] = useState<State>(props.defaultState ?? 'loading');

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
      <NextSeo {...props.seo} />
      <div className='flex h-full min-h-fit w-full flex-grow overflow-y-hidden'>
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
            className='fixed grid h-full w-full flex-grow place-items-center'
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
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut', type: 'tween' }}
            id='site-content'
            className={twMerge(
              'center-max-xl mt-4 flex h-auto w-full flex-grow flex-col gap-4 overflow-y-hidden px-4 pt-16',
              props.className && props.className,
            )}
          >
            {props.children}
          </motion.div>
        )}
      </div>
    </>
  );
}
