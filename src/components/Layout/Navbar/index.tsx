import { Button, Image } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import Link from 'components/Link';

interface IPages {
  name: string;
  href: string;
  isExternal?: boolean;
}
const PAGES: IPages[] = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Projects',
    href: '/projects',
  },
  {
    name: 'Blogs',
    href: '/blogs',
  },
  {
    name: '3D and Stuff',
    href: '/3d',
  },
  {
    name: 'About me',
    href: '/about',
  },
  {
    name: 'Contact',
    href: '/contact',
  },
  {
    name: 'Guestbook',
    href: '/guestbook',
  },
  {
    name: 'Source code',
    href: 'https://www.github.com/mbaharip/mbaharip-portfolio',
    isExternal: true,
  },
];

export default function Navbar() {
  const router = useRouter();
  const [drawerState, setDrawerState] = useState<'extended' | 'collapsed'>('collapsed');

  useEffect(() => {
    router.events.on('routeChangeStart', () => setDrawerState('collapsed'));

    return () => {
      router.events.off('routeChangeStart', () => setDrawerState('collapsed'));
    };
  }, [router.events]);

  return (
    <nav className='center-max-xl fixed top-0 z-50 h-fit'>
      <div className='relative top-0 z-50 h-full w-full p-2'>
        <div className='center-max-xl sticky left-1 top-2 z-50 flex w-[calc(100vw-1rem)] items-center justify-between rounded-full border border-divider bg-background/75 px-2 py-1 backdrop-blur lg:px-4'>
          <Image
            src='/logo.svg'
            alt='mbaharip logo'
            className='h-10 w-10'
            key={'navbar-logo'}
          />
          <div className='flex items-center gap-8'>
            <ul className='hidden items-center lg:flex'>
              {PAGES.map((page) => (
                <li key={page.name}>
                  <Link
                    href={page.href}
                    isExternal={page.isExternal}
                    isBlock
                    showAnchorIcon={page.isExternal}
                    color='foreground'
                    className={twMerge(
                      page.href === '/' && page.href === router.pathname && 'font-bold text-primary',
                      page.href !== '/' && router.pathname.startsWith(page.href) && 'font-bold text-primary',
                    )}
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Button
              variant='light'
              isIconOnly
              className='relative lg:hidden'
              radius='full'
              onPress={() => setDrawerState((state) => (state === 'extended' ? 'collapsed' : 'extended'))}
            >
              <Icon
                name='Menu'
                size='lg'
                className={twMerge(
                  'absolute rotate-0 opacity-100 transition duration-150',
                  drawerState === 'extended' && 'rotate-180 opacity-0',
                )}
              />
              <Icon
                name='X'
                size='lg'
                className={twMerge(
                  'absolute rotate-0 opacity-0 transition duration-150',
                  drawerState === 'extended' && 'rotate-180 opacity-100',
                )}
              />
            </Button>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, left: '-200%' }}
          animate={{
            opacity: drawerState === 'extended' ? 1 : 0,
            left: drawerState === 'extended' ? 0 : '-200%',
          }}
          transition={{ duration: 0.25, ease: 'easeInOut', type: 'tween' }}
          className='fixed top-0 h-full w-[200vw] bg-gradient-to-r from-background to-transparent backdrop-blur'
          onClick={() => setDrawerState('collapsed')}
        >
          <div
            className='w-screen pt-20'
            onClick={(e) => e.stopPropagation()}
          >
            <ul className='flex w-full flex-col'>
              {PAGES.map((page) => (
                <li
                  key={`${page.name}-m`}
                  className={twMerge(
                    'w-full px-4 py-2 text-foreground transition duration-150',
                    page.href === '/' &&
                      page.href === router.pathname &&
                      'bg-gradient-to-r from-primary/25 to-transparent px-6 font-bold',
                    page.href !== '/' &&
                      router.pathname.startsWith(page.href) &&
                      'bg-gradient-to-r from-primary/25 to-transparent px-6 font-bold',
                  )}
                >
                  <Link
                    href={page.href}
                    isExternal={page.isExternal}
                    showAnchorIcon={page.isExternal}
                    color={
                      (page.href === '/' && page.href === router.pathname) ||
                      (page.href !== '/' && router.pathname.startsWith(page.href))
                        ? 'primary'
                        : 'foreground'
                    }
                    className='w-full text-large'
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
