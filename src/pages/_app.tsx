import { Button, NextUIProvider } from '@nextui-org/react';
import { AnimatePresence, motion } from 'framer-motion';
import { SessionProvider } from 'next-auth/react';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import { JetBrains_Mono, Montserrat, Zen_Kaku_Gothic_New } from 'next/font/google';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-wrap-balancer';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import Footer from 'components/Layout/Footer';
import Navbar from 'components/Layout/Navbar';

import { SettingsProvider } from 'contexts/settings';

import defaultSEO from 'config/seo';
import toastConfig from 'config/toast';
import 'styles/globals.css';
import 'styles/highlight.css';
import 'styles/markdown.css';

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
      if (body) body.classList.add(montserrat.variable, kurenaido.variable, jetbrains.variable);
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
          <NextUIProvider>
            <div
              className={twMerge(
                `relative flex min-h-screen w-full max-w-[100vw] flex-col items-center justify-between overflow-x-hidden font-sans`,
              )}
            >
              <ToastContainer {...toastConfig} />
              <DefaultSeo {...defaultSEO} />
              <SettingsProvider>
                <Navbar key={'navbar'} />
                <main className='flex h-full w-full flex-grow flex-col'>
                  <Component {...pageProps} />
                </main>
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
              </SettingsProvider>
            </div>
          </NextUIProvider>
        </SessionProvider>
      </Provider>
    </AnimatePresence>
  );
}
