import { AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { motion as m } from 'framer-motion';
import type { AppProps } from 'next/app';
import { Exo_2 } from 'next/font/google';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-wrap-balancer';

import Footer from 'components/Footer';
import Navbar from 'components/Navbar';

import 'styles/globals.css';

const exo2 = Exo_2({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <div
      id='wrapper'
      className={`w-full min-h-screen flex flex-col items-center justify-between relative ${exo2.className}`}
    >
      <Navbar />
      <AnimatePresence
        mode='wait'
        onExitComplete={() => {
          if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
          }
        }}
      >
        {isLoading ? (
          <div
            className='w-fit h-fit max-h-[50vh] m-auto flex flex-1 items-center justify-center'
            key={`${router.asPath}`}
          >
            <video
              autoPlay
              loop
              muted
              className='w-24 h-24'
              controls={false}
            >
              <source
                src='/loading.webm'
                type='video/webm'
              />
            </video>
          </div>
        ) : (
          <main
            id='main'
            className='flex-1 max-w-screen-lg w-full mx-auto py-2 px-4 md:px-2 my-4 md:my-8'
            key={router.asPath}
          >
            <Component {...pageProps} />
          </main>
        )}
      </AnimatePresence>
      <Footer />
      <div className='fixed -z-50 bg-gradient-to-t from-zinc-950 to-black top-0 h-screen w-screen' />
    </div>
  );
}
