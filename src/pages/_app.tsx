import { Button, NextUIProvider } from '@nextui-org/react';
import { AnimatePresence, motion } from 'framer-motion';
import 'highlight.js/styles/github-dark.min.css';
import { SessionProvider } from 'next-auth/react';
import NextAdapterPages from 'next-query-params/pages';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import { JetBrains_Mono, Montserrat, Zen_Kaku_Gothic_New } from 'next/font/google';
import localFont from 'next/font/local';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-wrap-balancer';
import { SWRConfig } from 'swr';
import { twMerge } from 'tailwind-merge';
import { QueryParamProvider } from 'use-query-params';

import Icon from 'components/Icons';
import Footer from 'components/Layout/Footer';
import Navbar from 'components/Layout/Navbar';

import { SettingsProvider } from 'contexts/settings';
import { swrFetcher } from 'utils/swr';

import defaultSEO from 'config/seo';
import toastConfig from 'config/toast';
import 'styles/globals.css';
import 'styles/markdown.css';

export const geist = localFont({
  src: [
    {
      path: '../../public/fonts/Geist-Thin.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Geist-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Geist-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Geist-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Geist-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'block',
  preload: true,
  variable: '--font-geist',
});
export const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  preload: true,
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
});
export const kurenaido = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  preload: true,
  subsets: ['latin', 'latin-ext'],
  variable: '--font-kurenaido',
});
export const jetbrains = JetBrains_Mono({
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains-mono',
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();

  const [showToTop, setShowToTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowToTop(true);
      } else {
        setShowToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document !== undefined) {
      const body = document.querySelector('body');
      if (body) body.classList.add(geist.variable, montserrat.variable, kurenaido.variable, jetbrains.variable);
    }
  }, []);

  return (
    <AnimatePresence
      mode='wait'
      onExitComplete={() => {
        if (typeof window !== undefined) window.scrollTo(0, 0);
      }}
    >
      <Provider>
        <SessionProvider session={session}>
          <NextUIProvider navigate={router.push}>
            <div
              className={twMerge(
                `relative flex h-fit max-h-fit min-h-screen w-full max-w-[100vw] flex-col items-center justify-between font-sans`,
              )}
            >
              <QueryParamProvider adapter={NextAdapterPages}>
                <ToastContainer {...toastConfig} />
                <DefaultSeo {...defaultSEO} />
                <SWRConfig
                  value={{
                    loadingTimeout: 5000,
                    errorRetryCount: 5,
                    keepPreviousData: true,
                    fetcher: swrFetcher,
                  }}
                >
                  <SettingsProvider>
                    {!router.asPath.startsWith('/admin') && <Navbar key={'navbar'} />}
                    <main className='flex h-full w-full flex-grow flex-col'>
                      <Component {...pageProps} />
                    </main>

                    {!router.asPath.startsWith('/admin') && (
                      <>
                        <Footer />
                        <motion.div
                          initial={{
                            opacity: 0,
                            bottom: 0,
                          }}
                          animate={{
                            opacity: showToTop ? 1 : 0,
                            bottom: showToTop ? 20 : 0,
                            pointerEvents: showToTop ? 'auto' : 'none',
                            cursor: showToTop ? 'pointer' : 'default',
                          }}
                          className='fixed right-4 z-40'
                        >
                          <Button
                            isIconOnly
                            className='border border-divider bg-opacity-50 backdrop-blur'
                            onPress={() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <Icon name='ChevronUp' />
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </SettingsProvider>
                </SWRConfig>
              </QueryParamProvider>
            </div>
          </NextUIProvider>
        </SessionProvider>
      </Provider>
    </AnimatePresence>
  );
}
