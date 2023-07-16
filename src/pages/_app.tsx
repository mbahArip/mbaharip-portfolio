import { AnimatePresence, motion } from 'framer-motion';
import { DefaultSeo, DefaultSeoProps } from 'next-seo';
import type { AppProps } from 'next/app';
import { Inter, JetBrains_Mono, Quicksand } from 'next/font/google';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Footer from 'components/Footer';
import Loading from 'components/Loading';
import Navbar from 'components/Navbar';

import { SettingsProvider } from 'contexts/settings';

import { Settings } from 'types/api';

import 'styles/globals.css';
import 'styles/highlight.css';
import 'styles/markdown.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export default function App({ Component, pageProps }: AppProps) {
  const defaultSeo: DefaultSeoProps = {
    titleTemplate: '%s | mbahArip',
    defaultTitle: 'mbahArip',
    description: `Hello, I&apos;m Arief Rachmawan, a developer based in Bandung, Indonesia.`,
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
    themeColor: '#000000',
    openGraph: {
      url: process.env.NEXT_PUBLIC_SITE_URL,
      title: 'mbahArip',
      type: 'website',
      description: `Hello, I&apos;m Arief Rachmawan, a developer based in Bandung, Indonesia.`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/img/banner.webp`,
          width: 1200,
          height: 630,
        },
      ],
      siteName: 'mbahArip',
    },
    twitter: {
      cardType: 'summary_large_image',
      handle: '@mbahArip_',
      site: '@mbahArip_',
    },
    facebook: {
      appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID as string,
    },
    additionalMetaTags: [
      {
        name: 'twitter:title',
        content: 'mbahArip',
      },
      {
        name: 'twitter:description',
        content: `Hello, I&apos;m Arief Rachmawan, a developer based in Bandung, Indonesia.`,
      },
      {
        name: 'twitter:image',
        content: `${process.env.NEXT_PUBLIC_SITE_URL}/img/banner.webp`,
      },
    ],
  };

  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings>({
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isMaintenance: false,
    workingOn: [],
  });

  useEffect(() => {
    setIsLoading(true);
    const fetchSettings = fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/settings`,
    );

    Promise.all([fetchSettings])
      .then(([settings]) => {
        settings.json().then((data) => {
          setSettings(data.data);
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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
      className={`w-full min-h-screen flex flex-col items-center justify-between relative ${inter.variable} ${quicksand.variable} ${jetbrainsMono.variable}`}
    >
      <DefaultSeo
        {...defaultSeo}
        key={`defaultSEO-${router.asPath}`}
      />
      <Navbar />
      <AnimatePresence
        mode='wait'
        onExitComplete={() => {
          if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
          }
        }}
      >
        <SettingsProvider value={settings}>
          {isLoading ? (
            <Loading />
          ) : (
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              id='main'
              className='flex-1 flex flex-col max-w-screen-lg w-full mx-auto py-2 px-4 md:px-2 my-4'
              key={router.asPath}
            >
              <Component {...pageProps} />
            </motion.main>
          )}
        </SettingsProvider>
      </AnimatePresence>
      <Footer />
      <div className='fixed -z-50 bg-gradient-to-t from-zinc-950 to-black top-0 h-screen w-screen' />
    </div>
  );
}
