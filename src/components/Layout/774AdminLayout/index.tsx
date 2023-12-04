import { motion } from 'framer-motion';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Loading from 'components/Loading';

import { State } from 'types/Common';

import ContentHeader from './ContentHeader';
import NanashiLogo from './Logo';
import NavigationList from './NavigationList';
import UserArea from './UserArea';

interface NanashiLayoutProps {
  children: React.ReactNode;
  header: {
    title: string;
    subtitle?: string;
  };
  headerComponent?: React.ReactNode;
  seo?: Omit<NextSeoProps, 'nofollow' | 'noindex' | 'robotsProps'>;
}
export default function NanashiLayout(props: NanashiLayoutProps) {
  const router = useRouter();

  const [pageState, setPageState] = useState<State>('loading');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPageState('idle');
    }, 50);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = (data: any) => {
      const currentPath = router.asPath.split('?')[0];
      const nextPath = data.split('?')[0];
      if (currentPath !== nextPath) {
        setPageState('loading');
      }
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
  }, [router.events, router.asPath]);

  return (
    <>
      <NextSeo
        {...props.seo}
        noindex
        nofollow
        robotsProps={{
          noarchive: true,
          noimageindex: true,
          nosnippet: true,
          notranslate: true,
        }}
      />
      <div className='grid h-screen w-screen place-items-center md:hidden'>
        <span className='text-default-500'>Mobile view is not supported.</span>
        <NanashiLogo className='absolute bottom-4 left-1/2 -translate-x-1/2 ' />
      </div>
      <div className='hidden h-full min-h-screen w-full flex-grow md:flex'>
        <aside
          key={'admin-sidebar'}
          className='sticky top-0 h-screen w-[15vw] border-r border-divider bg-content1/50 px-6 py-4'
        >
          <div
            key={'admin-sidebar-container'}
            className='flex h-full flex-col items-center justify-between'
          >
            <NanashiLogo
              key={'admin-sidebar-logo'}
              className='py-2 text-large'
            />
            <NavigationList key={'admin-sidebar-menu'} />
            <UserArea key={'admin-sidear-user'} />
          </div>
        </aside>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={twMerge(
            'flex h-full min-h-screen w-full max-w-[85vw] flex-grow bg-content1/30 px-6 py-4',
            pageState === 'loading' ? 'items-center justify-center' : 'flex-col items-start justify-start',
          )}
        >
          {pageState === 'loading' ? (
            <Loading />
          ) : (
            <>
              <ContentHeader
                title={props.header?.title || props.seo?.title || 'No title'}
                subtitle={props.header?.subtitle || 'undefined'}
                extraComponent={props.headerComponent}
              />
              {props.children}
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
